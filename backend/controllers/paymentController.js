const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Map plan name → Razorpay Plan ID from env
const PLAN_IDS = {
    plus:  process.env.RAZORPAY_PLAN_PLUS,
    pro:   process.env.RAZORPAY_PLAN_PRO,
    power: process.env.RAZORPAY_PLAN_POWER
};

// ── Create Subscription ──────────────────────────────────────────────────────
// Called when user clicks Upgrade. Creates a Razorpay subscription and returns
// the subscription_id to the frontend so Razorpay checkout can open.
const createSubscription = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!PLAN_IDS[plan]) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: PLAN_IDS[plan],
            customer_notify: 1,      // Razorpay sends payment reminders to user
            quantity: 1,
            total_count: 12,         // max 12 billing cycles (1 year); renews unless cancelled
            notes: {
                userId: req.user.id,
                plan
            }
        });

        res.status(200).json({
            subscription_id: subscription.id,
            plan
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
};

// ── Verify Subscription Payment ──────────────────────────────────────────────
// Called immediately after Razorpay checkout succeeds on the frontend.
// Verifies the signature, then upgrades the user's plan right away.
// The webhook will handle all future renewals — this just handles the first payment.
const verifySubscription = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            plan
        } = req.body;

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !plan) {
            return res.status(400).json({ message: 'Missing payment fields' });
        }

        // Signature for subscriptions is: payment_id + '|' + subscription_id
        const body = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Set currentPeriodEnd to 30 days from now
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

        await User.findByIdAndUpdate(req.user.id, {
            plan,
            subscriptionId: razorpay_subscription_id,
            subscriptionStatus: 'active',
            currentPeriodEnd
        });

        res.status(200).json({ message: 'Subscription activated', plan });

    } catch (error) {
        console.error('Verify subscription error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};

// ── Webhook ──────────────────────────────────────────────────────────────────
// Razorpay calls this automatically on every billing event.
// NO auth middleware on this route — Razorpay calls it, not the user.
// We verify it's genuinely from Razorpay using the webhook secret.
const handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Webhook signature mismatch');
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const subscription = req.body.payload?.subscription?.entity;
        const payment = req.body.payload?.payment?.entity;

        if (!subscription) {
            return res.status(200).json({ received: true });
        }

        const subscriptionId = subscription.id;

        // Find which user this subscription belongs to
        const user = await User.findOne({ subscriptionId });
        if (!user) {
            // Could be a new subscription — check notes
            const userId = subscription.notes?.userId;
            if (!userId) return res.status(200).json({ received: true });
        }

        if (event === 'subscription.charged') {
            // Successful recurring payment — extend access by 30 days
            const currentPeriodEnd = new Date();
            currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

            // Get plan from notes
            const plan = subscription.notes?.plan || user?.plan;

            await User.findOneAndUpdate(
                { subscriptionId },
                {
                    plan,
                    subscriptionStatus: 'active',
                    currentPeriodEnd
                }
            );
        }

        if (event === 'subscription.cancelled' || event === 'subscription.completed') {
            // User cancelled or billing cycles exhausted — downgrade at period end
            // We don't downgrade immediately; currentPeriodEnd handles that
            await User.findOneAndUpdate(
                { subscriptionId },
                { subscriptionStatus: 'cancelled' }
            );
        }

        if (event === 'subscription.halted') {
            // Multiple payment failures — Razorpay halted the subscription
            // Downgrade immediately
            await User.findOneAndUpdate(
                { subscriptionId },
                {
                    plan: 'free',
                    subscriptionStatus: 'halted',
                    currentPeriodEnd: null
                }
            );
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

module.exports = { createSubscription, verifySubscription, handleWebhook };