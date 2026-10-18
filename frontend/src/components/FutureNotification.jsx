// // When a debit transaction pushes a category over its limit
// // Fire this inside AddTransaction's handleSubmit, after the API call succeeds
// if (budgetWarning) {
//     setNotification({
//         id: 'budget-exceeded',
//         icon: '⚠️',
//         title: `${category} budget exceeded`,
//         subtitle: `You've gone ₹${overBy.toLocaleString('en-IN')} over your limit`,
//         actionLabel: 'View Budget',
//         autoDismiss: 7000,
//     })
// }

// // When user logs income on what Artha detects as salary day pattern
// setNotification({
//     id: 'salary-day',
//     icon: '💰',
//     title: 'Salary day?',
//     subtitle: 'You usually receive income around this time',
//     actionLabel: 'Log Income',
//     autoDismiss: 10000,
// })

// // When savings goal is completed
// setNotification({
//     id: 'goal-complete',
//     icon: '🎯',
//     title: `${goalName} complete!`,
//     subtitle: "You hit your savings target",
//     actionLabel: 'View Goals',
//     autoDismiss: 8000,
// })

// // When subscription expires (check on app load in App.jsx)
// if (user?.subscriptionStatus === 'halted') {
//     setNotification({
//         id: 'sub-halted',
//         icon: '💳',
//         title: 'Payment failed',
//         subtitle: 'Your Artha Plus access has been paused',
//         actionLabel: 'Update Payment',
//     })
//     // No autoDismiss — user must act
// }


// EXAMPLE OF USING IT















// src/components/InAppNotification.jsx
import { motion, AnimatePresence } from 'framer-motion'

export default function InAppNotification({ notification, onDismiss, onAction }) {
    // notification shape:
    // {
    //   id: 'update' | 'budget-exceeded' | 'subscription-due' | 'welcome' | 'salary-day' | ...
    //   icon: '✦' | '⚠' | '💳' | '👋' | ...
    //   title: string
    //   subtitle: string
    //   actionLabel: string   (optional)
    //   dismissLabel: string  (defaults to 'Dismiss')
    //   autoDismiss: number   (ms, optional — omit to stay until user acts)
    // }

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, scaleX: 0.25, scaleY: 0.25, borderRadius: '999px' }}
                    animate={{ opacity: 1, scaleX: 1, scaleY: 1, borderRadius: '20px' }}
                    exit={{ opacity: 0, scaleX: 0.25, scaleY: 0.25, borderRadius: '999px' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30, opacity: { duration: 0.12 } }}
                    style={{
                        position: 'fixed',
                        top: '12px',
                        left: '50%',
                        translateX: '-50%',
                        transformOrigin: 'top center',
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        padding: '14px 16px',
                        width: 'calc(100vw - 24px)',
                        maxWidth: '400px',
                        zIndex: 9999,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.18, duration: 0.2 }}
                        className="flex flex-col gap-3"
                    >
                        {/* top row — icon + text */}
                        <div className="flex items-start gap-3">
                            <span className="text-base mt-0.5">{notification.icon}</span>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-white text-sm font-semibold leading-tight">{notification.title}</p>
                                <p className="text-zinc-500 text-xs">{notification.subtitle}</p>
                            </div>
                        </div>

                        {/* bottom row — buttons */}
                        <div className="flex items-center gap-2 pl-7">
                            {notification.actionLabel && (
                                <button
                                    onClick={onAction}
                                    className="text-xs font-semibold px-4 py-1.5 rounded-full text-black bg-white"
                                >
                                    {notification.actionLabel}
                                </button>
                            )}
                            <button
                                onClick={onDismiss}
                                className="text-xs text-zinc-500 px-3 py-1.5 rounded-full"
                                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                {notification.dismissLabel || 'Dismiss'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// // In App.jsx or any page
// import InAppNotification from './components/InAppNotification'
// const [notification, setNotification] = useState(null)

// const dismiss = () => setNotification(null)

// // App update
// setNotification({
//     id: 'update',
//     icon: '✦',
//     title: 'Artha just got better',
//     subtitle: 'v1.3.2 is here',
//     actionLabel: "What's new",
//     dismissLabel: 'Ignore',
// })

// // Budget exceeded
// setNotification({
//     id: 'budget-exceeded',
//     icon: '⚠️',
//     title: 'Budget exceeded',
//     subtitle: 'You\'ve gone over your Food & Dining limit',
//     actionLabel: 'View Budget',
//     autoDismiss: 6000,
// })

// // Subscription due
// setNotification({
//     id: 'subscription-due',
//     icon: '💳',
//     title: 'Spotify renews tomorrow',
//     subtitle: '₹69 will be charged on 20 Oct',
//     actionLabel: 'View',
//     autoDismiss: 8000,
// })

// // Welcome back
// setNotification({
//     id: 'welcome',
//     icon: '👋',
//     title: `Welcome back, ${user.name}`,
//     subtitle: 'Your finances are up to date',
//     autoDismiss: 4000,
// })

// // Salary day pattern
// setNotification({
//     id: 'salary-day',
//     icon: '💰',
//     title: 'Salary day today',
//     subtitle: 'Artha noticed you usually receive income around the 3rd',
//     actionLabel: 'Log Income',
//     autoDismiss: 10000,
// })

// // Then render it
// <InAppNotification
//     notification={notification}
//     onDismiss={dismiss}
//     onAction={() => { /* handle per id */ dismiss() }}
// />