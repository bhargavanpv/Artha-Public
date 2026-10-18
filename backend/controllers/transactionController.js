const Transaction = require('../models/Transaction');
const categorize = require('../utils/categorize');
const Papa = require('papaparse');
const bankFormats = require("../bank-formats");
const XLSX = require('xlsx');

const addTransaction = async (req, res) => {
    const { description, amount, type, date, category, note } = req.body;
    try {
        const transaction = await Transaction.create({
            userId: req.user.id,
            description,
            amount,
            type,
            date,
            category: category || categorize(description),
            merchant: description.split(' ')[0],
            note
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTransaction = async (req, res) => {
    try {
        const completedTransactions = await Transaction.find({
            userId: req.user.id
        }).sort({ date: -1 });
        res.status(200).json(completedTransactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No File Uploaded!" });
        }

        const bankKey = req.body.bank?.toLowerCase();
        const format = bankFormats[bankKey];

        if (!format) {
            return res.status(400).json({
                message: `Bank not supported. Supported: ${Object.keys(bankFormats).join(', ')}`
            });
        }

        const userMapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;
        const dateCol   = userMapping?.date        || format.date;
        const descCol   = userMapping?.description || format.description;
        const debitCol  = userMapping?.debit       || format.debit;
        const creditCol = userMapping?.credit      || format.credit;

        let rows = [];

        if (req.file.mimetype === 'text/csv') {
            const csvText = req.file.buffer.toString('utf8');
            const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            rows = result.data;
        } else if (
            req.file.mimetype === 'application/vnd.ms-excel' ||
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
        } else {
            return res.status(400).json({ message: "Unsupported file format. Please upload CSV or Excel." });
        }

        const transactions = rows.map(row => {
            const description = String(row[descCol] || '');
            const debit  = parseFloat(String(row[debitCol]  || 0).replace(/,/g, '').replace(/[₹$]/g, '')) || 0;
            const credit = parseFloat(String(row[creditCol] || 0).replace(/,/g, '').replace(/[₹$]/g, '')) || 0;
            const amount = debit > 0 ? debit : credit;
            const type   = debit > 0 ? 'debit' : 'credit';

            const rawDate = row[dateCol];
            let date;
            if (rawDate instanceof Date) {
                date = rawDate;
            } else if (rawDate && String(rawDate).includes('/')) {
                const [day, month, year] = String(rawDate).split('/');
                date = new Date(`${year}-${month}-${day}`);
            } else {
                date = new Date(rawDate);
            }

            return {
                userId: req.user.id,
                date,
                description,
                amount,
                type,
                category: categorize(description),
                merchant: description.split(' ')[0]
            };
        }).filter(t => t.amount > 0 && t.description && !isNaN(t.date));

        if (transactions.length === 0) {
            return res.status(400).json({ message: "No valid transactions found. Please check your column mapping." });
        }

        const saved = await Transaction.insertMany(transactions);
        return res.status(201).json({
            message: `${saved.length} transactions imported from ${format.name} ✅`,
            transactions: saved
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        return res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        const transactions = await Transaction.find({ userId: req.user.id });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear  = now.getFullYear();

        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent  = thisMonthTxns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        const totalIncome = thisMonthTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const totalDebits  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        const netCashFlow  = totalCredits - totalDebits;

        // net cash flow only from the date they set their balance
        let netCashFlowFromDate = netCashFlow;
        if (user?.hasSetBalance && user?.balanceSetDate) {
            const fromDate = new Date(user.balanceSetDate)
            fromDate.setHours(0, 0, 0, 0)  // ← ADD THIS. compare from start of day
            const txnsAfter = transactions.filter(t => new Date(t.date) >= fromDate)
            const creditsAfter = txnsAfter.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
            const debitsAfter = txnsAfter.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
            netCashFlowFromDate = creditsAfter - debitsAfter
        }

        const categoryBreakdown = {};
        const categoryIncomeBreakdown = {};
        transactions.forEach(t => {
            if (t.type === 'debit') {
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
            } else {
                categoryIncomeBreakdown[t.category] = (categoryIncomeBreakdown[t.category] || 0) + t.amount;
            }
        });

        const merchantTotals = {};
        transactions.filter(t => t.type === 'debit').forEach(t => {
            merchantTotals[t.merchant] = (merchantTotals[t.merchant] || 0) + t.amount;
        });
        const topMerchants = Object.entries(merchantTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([merchant, total]) => ({ merchant, total }));

        const monthlySpendings = {};
        transactions.filter(t => t.type === 'debit').forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlySpendings[key] = (monthlySpendings[key] || 0) + t.amount;
        });
        const sortedMonthlySpendings = Object.entries(monthlySpendings)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .reduce((obj, [k, v]) => { obj[k] = v; return obj; }, {});

        res.status(200).json({
            netCashFlow,
            netCashFlowFromDate,
            totalCredits,
            totalDebits,
            'Total Spent This Month': totalSpent,
            'Total Income This Month': totalIncome,
            categoryIncomeBreakdown,
            categoryBreakdown,
            topMerchants,
            monthlySpendings: sortedMonthlySpendings
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUncategorized = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user.id,
            category: "Uncategorized"
        }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { category },
            { new: true }
        );
        if (!transaction) return res.status(404).json({ message: "Transaction Not Found" });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAllTransactions = async (req, res) => {
    try {
        const result = await Transaction.deleteMany({ userId: req.user.id });
        res.status(200).json({
            message: `${result.deletedCount} transactions deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBankFormats = (req, res) => {
    const bankKey = req.params.bank?.toLowerCase();
    const format  = bankFormats[bankKey];
    if (!format) return res.status(400).json({ message: `Bank not supported.` });
    res.status(200).json({
        name: format.name,
        fields: { date: format.date, description: format.description, debit: format.debit, credit: format.credit }
    });
};

const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { description, amount, type, date, category, note } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { description, amount, type, date, category, note },
            { new: true }
        );
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthComparision = async (req, res) => {
    try {
        const userId = req.user.id;
        const now    = new Date();

        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth      = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentTxns, prevTxns] = await Promise.all([
            Transaction.find({ userId, date: { $gte: startOfCurrentMonth } }),
            Transaction.find({ userId, date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } })
        ]);

        const sum = (txns, type) => txns.filter(t => t.type === type).reduce((a, t) => a + t.amount, 0);

        const currentIncome  = sum(currentTxns, 'credit');
        const currentExpense = sum(currentTxns, 'debit');
        const prevIncome     = sum(prevTxns, 'credit');
        const prevExpense    = sum(prevTxns, 'debit');

        const percentChange = (curr, prev) =>
            prev === 0 ? null : parseFloat(((curr - prev) / prev * 100).toFixed(1));

        res.status(200).json({
            currentMonth: { income: currentIncome,  expense: currentExpense },
            prevMonth:    { income: prevIncome,      expense: prevExpense },
            comparison: {
                incomeChange:  percentChange(currentIncome,  prevIncome),
                expenseChange: percentChange(currentExpense, prevExpense),
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch comparison' });
    }
};

// GET /transactions/monthly-summary — income & expense for current month only
const getMonthlySummary = async (req, res) => {
    try {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const transactions = await Transaction.find({
            userId: req.user.id,
            date: { $gte: start, $lte: end }
        })

        const income = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0)

        const expense = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0)

        res.json({
            income: Math.round(income),
            expense: Math.round(expense),
            net: Math.round(income - expense),
            month: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /transactions/monthly-comparison — this month vs last month %
const getMonthlyComparison = async (req, res) => {
    try {
        const now = new Date()

        const thisStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        const [thisMonth, lastMonth] = await Promise.all([
            Transaction.find({ userId: req.user.id, date: { $gte: thisStart, $lte: thisEnd } }),
            Transaction.find({ userId: req.user.id, date: { $gte: lastStart, $lte: lastEnd } })
        ])

        const calc = (txns) => ({
            income: txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
            expense: txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
        })

        const current = calc(thisMonth)
        const previous = calc(lastMonth)

        const pctChange = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0
            return Math.round(((curr - prev) / prev) * 100)
        }

        res.json({
            thisMonth: {
                income: Math.round(current.income),
                expense: Math.round(current.expense),
            },
            lastMonth: {
                income: Math.round(previous.income),
                expense: Math.round(previous.expense),
            },
            change: {
                incomePercent: pctChange(current.income, previous.income),
                expensePercent: pctChange(current.expense, previous.expense),
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getStory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })

        if (transactions.length === 0) {
            return res.status(200).json({ empty: true })
        }

        // Heatmap — last 365 days, debit amounts per day
        const heatmap = {}
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 365)

        transactions.forEach(t => {
            const d = new Date(t.date)
            if (d < cutoff) return
            const key = d.toISOString().split('T')[0]
            if (t.type === 'debit') {
                heatmap[key] = (heatmap[key] || 0) + t.amount
            }
        })

        // Records
        const debits = transactions.filter(t => t.type === 'debit')
        const credits = transactions.filter(t => t.type === 'credit')

        const biggestExpense = debits.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null)
        const biggestIncome = credits.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null)
        const smallestExpense = debits.length > 0
            ? debits.reduce((min, t) => t.amount < (min?.amount || Infinity) ? t : min, null)
            : null

        // Monthly totals
        const monthlyMap = {}
        debits.forEach(t => {
            const d = new Date(t.date)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthlyMap[key] = (monthlyMap[key] || 0) + t.amount
        })
        const monthlyEntries = Object.entries(monthlyMap)
        const mostExpensiveMonth = monthlyEntries.length > 0
            ? monthlyEntries.reduce((max, [k, v]) => v > max.amount ? { key: k, amount: v } : max, { key: '', amount: 0 })
            : null

        // Day of week spend
        const dowSpend = Array(7).fill(0)
        const dowCount = Array(7).fill(0)
        debits.forEach(t => {
            const dow = new Date(t.date).getDay()
            dowSpend[dow] += t.amount
            dowCount[dow]++
        })

        // Category totals
        const categoryMap = {}
        debits.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
        })
        const topCategory = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])[0] || null

        // Average monthly spend
        const avgMonthlySpend = monthlyEntries.length > 0
            ? Math.round(monthlyEntries.reduce((s, [, v]) => s + v, 0) / monthlyEntries.length)
            : 0

        res.status(200).json({
            empty: false,
            heatmap,
            records: {
                biggestExpense: biggestExpense ? { amount: biggestExpense.amount, description: biggestExpense.description, date: biggestExpense.date } : null,
                biggestIncome: biggestIncome ? { amount: biggestIncome.amount, description: biggestIncome.description, date: biggestIncome.date } : null,
                smallestExpense: smallestExpense ? { amount: smallestExpense.amount, description: smallestExpense.description } : null,
                mostExpensiveMonth: mostExpensiveMonth,
                totalTransactions: transactions.length,
                totalDebits: debits.length,
                totalCredits: credits.length,
                topCategory: topCategory ? { name: topCategory[0], total: Math.round(topCategory[1]) } : null,
                avgMonthlySpend,
            },
            dowSpend,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getMonthComparision, getBankFormats, deleteAllTransactions,
    addTransaction, getTransaction, uploadStatement,
    getStats, getUncategorized, updateCategory,
    deleteTransaction, updateTransaction,
    getMonthlySummary,
    getMonthlyComparison,
    getStory
};

