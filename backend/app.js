const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors")

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require("./routes/aiRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bugReportRoutes = require("./routes/bugReportRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const savingsRoutes = require('./routes/savingsRoutes')
const adminRoutes = require('./routes/adminRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();

app.use(cors({
    origin: [
        "https://artha-48x.pages.dev",
        "http://localhost:5173",
        "https://getarthaai.com",
        "https://www.getarthaai.com"
    ],
    credentials: true
}))

// Webhook needs raw body BEFORE express.json() — only this one route
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

// Everything else gets JSON parsing
app.use(express.json({ limit: "50mb" }))

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes)
app.use('/api/categories', categoryRoutes);
app.use('/api/bugreport', bugReportRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/payment', paymentRoutes);
app.use('/api/savings', savingsRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/budget', budgetRoutes);

connectDB();

app.listen(5000, () => {
    console.log(">>>Artha backend running on port 5000");
});