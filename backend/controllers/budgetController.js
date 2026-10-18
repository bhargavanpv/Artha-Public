const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// ─── helper: compute spent per category from transactions ───────────────────
const computeSpent = (transactions, month, year) => {
    const spent = {};
    transactions.forEach(t => {
        if (t.type !== 'debit') return;
        const d = new Date(t.date);
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
        spent[t.category] = (spent[t.category] || 0) + t.amount;
    });
    return spent;
};

// ─── GET /budget/active ─────────────────────────────────────────────────────
const getActiveBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.user.id, status: 'active' });
        if (!budget) return res.status(200).json(null);

        const transactions = await Transaction.find({ userId: req.user.id });
        const spent = computeSpent(transactions, budget.month, budget.year);

        // total spent across all allocated categories
        const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
        const totalAllocated = budget.allocations.reduce((s, a) => s + a.limit, 0);

        // projected month-end spend based on velocity
        const now = new Date()
        const daysInMonth = new Date(budget.year, budget.month + 1, 0).getDate()

        // If budget month hasn't started yet
        const budgetStart = new Date(budget.year, budget.month, 1)
        const isUpcoming = now < budgetStart

        let daysPassed, projectedSpend
        if (isUpcoming) {
            daysPassed = 0
            projectedSpend = 0
        } else {
            daysPassed = now.getDate()
            projectedSpend = daysPassed > 0
                ? Math.round((totalSpent / daysPassed) * daysInMonth)
                : 0
        }

        const daysUntilStart = isUpcoming
            ? Math.ceil((budgetStart - now) / (1000 * 60 * 60 * 24))
            : 0
        
        res.status(200).json({
            ...budget.toObject(),
            spent,           // { Food: 6400, Travel: 840, ... }
            totalSpent,
            totalAllocated,
            projectedSpend,
            daysInMonth,
            daysPassed,
            isUpcoming,
            daysUntilStart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /budget/all ────────────────────────────────────────────────────────
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id }).sort({ year: -1, month: -1 });
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /budget/:id ────────────────────────────────────────────────────────
const getBudgetById = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        const transactions = await Transaction.find({ userId: req.user.id });
        const spent = computeSpent(transactions, budget.month, budget.year);
        const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
        const totalAllocated = budget.allocations.reduce((s, a) => s + a.limit, 0);

        // ── report-level insights (used for completed budgets) ──
        const monthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === budget.month && d.getFullYear() === budget.year;
        });

        const debitTxns = monthTxns.filter(t => t.type === 'debit');
        const creditTxns = monthTxns.filter(t => t.type === 'credit');
        const incomeActual = creditTxns.reduce((s, t) => s + t.amount, 0);

        // spending by day-of-week
        const byDow = Array(7).fill(0);
        debitTxns.forEach(t => { byDow[new Date(t.date).getDay()] += t.amount; });

        // spending by week (week 1-4)
        const byWeek = [0, 0, 0, 0];
        debitTxns.forEach(t => {
            const week = Math.min(Math.floor((new Date(t.date).getDate() - 1) / 7), 3);
            byWeek[week] += t.amount;
        });

        // most expensive single transaction
        const biggestTxn = debitTxns.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null);

        // avg daily spend
        const daysInMonth = new Date(budget.year, budget.month + 1, 0).getDate();
        const avgDailySpend = Math.round(totalSpent / daysInMonth);

        // first half vs second half
        const mid = Math.floor(daysInMonth / 2);
        const firstHalf = debitTxns.filter(t => new Date(t.date).getDate() <= mid).reduce((s, t) => s + t.amount, 0);
        const secondHalf = debitTxns.filter(t => new Date(t.date).getDate() > mid).reduce((s, t) => s + t.amount, 0);

        res.status(200).json({
            ...budget.toObject(),
            spent,
            totalSpent,
            totalAllocated,
            incomeActual,
            insights: {
                avgDailySpend,
                biggestTxn,
                byWeek,
                byDow,
                firstHalf: Math.round(firstHalf),
                secondHalf: Math.round(secondHalf),
                transactionCount: debitTxns.length,
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── POST /budget ────────────────────────────────────────────────────────────
const createBudget = async (req, res) => {
    try {
        const { name, month, year, incomeExpected, allocations } = req.body;

        // deactivate any existing active budget first
        await Budget.updateMany(
            { userId: req.user.id, status: 'active' },
            { status: 'completed', completedAt: new Date() }
        );

        const budget = await Budget.create({
            userId: req.user.id,
            name,
            month,
            year,
            incomeExpected: incomeExpected || 0,
            allocations: allocations || [],
            status: 'active',
        });

        res.status(201).json(budget);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A budget already exists for this month.' });
        }
        res.status(500).json({ message: err.message });
    }
};

// ─── PUT /budget/:id ─────────────────────────────────────────────────────────
// update name, allocations, incomeExpected, add/remove categories
const updateBudget = async (req, res) => {
    try {
        const { name, incomeExpected, allocations } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name, incomeExpected, allocations },
            { new: true }
        );
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── PATCH /budget/:id/allocation ────────────────────────────────────────────
// add or update a single category allocation (used from AddTransaction)
const upsertAllocation = async (req, res) => {
    try {
        const { category, limit } = req.body;
        if (!category || limit == null) {
            return res.status(400).json({ message: 'category and limit required' });
        }

        const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        const existing = budget.allocations.find(a => a.category === category);
        if (existing) {
            existing.limit = limit;
        } else {
            budget.allocations.push({ category, limit });
        }

        await budget.save();
        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── POST /budget/:id/roll ────────────────────────────────────────────────────
// roll budget to next month — copies allocations, increments month/year
const rollBudget = async (req, res) => {
    try {
        const source = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
        if (!source) return res.status(404).json({ message: 'Budget not found' });

        let newMonth = source.month + 1;
        let newYear = source.year;
        if (newMonth > 11) { newMonth = 0; newYear += 1; }

        const monthName = new Date(newYear, newMonth, 1)
            .toLocaleString('en-IN', { month: 'long' });

        // deactivate current active if any
        await Budget.updateMany(
            { userId: req.user.id, status: 'active' },
            { status: 'completed', completedAt: new Date() }
        );

        const rolled = await Budget.create({
            userId: req.user.id,
            name: `${monthName} ${newYear} Budget`,
            month: newMonth,
            year: newYear,
            incomeExpected: source.incomeExpected,
            allocations: source.allocations,
            status: 'active',
        });

        res.status(201).json(rolled);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A budget already exists for that month.' });
        }
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE /budget/:id ───────────────────────────────────────────────────────
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.status(200).json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /budget/active/category-status?category=Food ────────────────────────
// used by AddTransaction to show budget pill for a category
const getCategoryStatus = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) return res.status(400).json({ message: 'category required' });

        const budget = await Budget.findOne({ userId: req.user.id, status: 'active' });
        if (!budget) return res.status(200).json(null);

        const allocation = budget.allocations.find(a => a.category === category);
        if (!allocation) return res.status(200).json({ budgetId: budget._id, allocated: false });

        const transactions = await Transaction.find({ userId: req.user.id });
        const spent = computeSpent(transactions, budget.month, budget.year);
        const spentForCategory = spent[category] || 0;

        res.status(200).json({
            budgetId: budget._id,
            allocated: true,
            category,
            limit: allocation.limit,
            spent: spentForCategory,
            percent: Math.round((spentForCategory / allocation.limit) * 100),
            isOver: spentForCategory > allocation.limit,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getActiveBudget,
    getAllBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    upsertAllocation,
    rollBudget,
    deleteBudget,
    getCategoryStatus,
};