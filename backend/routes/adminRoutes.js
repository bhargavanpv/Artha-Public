// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Feedback = require('../models/Feedback');

// ── Auth middleware ───────────────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// ── GET /admin/overview ───────────────────────────────────────────────────────
router.get('/overview', adminAuth, async (req, res) => {
    try {
        const [totalUsers, totalTransactions, totalFeedback, users] = await Promise.all([
            User.countDocuments(),
            Transaction.countDocuments(),
            Feedback.countDocuments(),
            User.find({}, 'name email plan createdAt dailyMessageCount lastMessageDate balanceMode').sort({ createdAt: -1 })
        ]);

        // Plan distribution
        const planCounts = { free: 0, plus: 0, pro: 0, power: 0 };
        users.forEach(u => { planCounts[u.plan] = (planCounts[u.plan] || 0) + 1; });

        // Users per day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsers = await User.find(
            { createdAt: { $gte: thirtyDaysAgo } },
            'createdAt'
        );

        const dailySignups = {};
        recentUsers.forEach(u => {
            const day = u.createdAt.toISOString().slice(0, 10);
            dailySignups[day] = (dailySignups[day] || 0) + 1;
        });

        // Fill missing days with 0
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            if (!dailySignups[key]) dailySignups[key] = 0;
        }

        const signupTimeline = Object.entries(dailySignups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        // Per-user transaction counts
        const txCounts = await Transaction.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]);
        const txMap = {};
        txCounts.forEach(t => { txMap[t._id.toString()] = t.count; });

        const usersWithTx = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            plan: u.plan,
            createdAt: u.createdAt,
            lastMessageDate: u.lastMessageDate,
            transactionCount: txMap[u._id.toString()] || 0,
        }));

        // Recent feedbacks (last 5)
        const recentFeedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email mainFeedback consentToDisplay createdAt anonymous');

        res.json({
            totalUsers,
            totalTransactions,
            totalFeedback,
            planCounts,
            signupTimeline,
            users: usersWithTx,
            recentFeedback,
        });
    } catch (err) {
        console.error('Admin overview error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;