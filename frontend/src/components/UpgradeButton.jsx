import { useState } from 'react'
import api from '../api/axios'

const PLAN_LABELS = {
    plus:  'Artha Plus',
    pro:   'Artha Pro',
    power: 'Artha Power'
}

function UpgradeButton({ plan, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handlePayment = async () => {
        setLoading(true)
        setError('')

        try {
            // Step 1 — create subscription on backend, get subscription_id
            const { data } = await api.post('/payment/create-subscription', { plan })

            // Step 2 — open Razorpay checkout with subscription_id
            // Note: subscriptions use subscription_id, NOT order_id
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: data.subscription_id,  // <-- key difference from orders
                name: 'Artha AI',
                description: `${PLAN_LABELS[plan]} — Monthly`,
                handler: async (response) => {
                    try {
                        // Step 3 — verify on backend
                        // Subscription response has different fields than order response
                        await api.post('/payment/verify-subscription', {
                            razorpay_payment_id:      response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature:       response.razorpay_signature,
                            plan
                        })
                        onSuccess(plan)
                    } catch (err) {
                        setError('Payment verification failed. Contact support.')
                        setLoading(false)
                    }
                },
                prefill: {},
                theme: { color: '#6366f1' },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', () => {
                setError('Payment failed. Please try again.')
                setLoading(false)
            })
            rzp.open()

        } catch (err) {
            setError('Could not initiate payment. Try again.')
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold mb-2 transition-all active:scale-[0.98]"
                style={{
                    background: plan === 'plus'  ? 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)' :
                                plan === 'pro'   ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)' :
                                plan === 'power' ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' :
                                'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)',
                    color: '#000',
                    fontWeight: '700',
                    opacity: loading ? 0.6 : 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {loading ? 'Processing...' : `Upgrade to ${PLAN_LABELS[plan]}`}
            </button>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
    )
}

export default UpgradeButton