const express = require('express');
const router = express.Router();
const { createSubscription, verifySubscription, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Webhook must use raw body — no auth, Razorpay calls this directly
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/create-subscription', protect, createSubscription);
router.post('/verify-subscription', protect, verifySubscription);

module.exports = router;