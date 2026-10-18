import { motion, AnimatePresence } from "framer-motion";

const UPDATES = [    
    {
    name: "New Icon and Time Bug Fixes",
    version: "v2.0.1",
    date: "7th Oct 2026",
    color: "#e879f9",
    description: "Budgeting is live for Pro and Power users. Your financial story unlocks after 7 days and 20 transactions.",
    features: [
        { text: "Fixed time delay issue on adding a transaction" },
        { text: "New icon inManage Savings " }
        
    ]
},
{
    name: "Budgeting & Your Story",
    version: "v2.0.0",
    date: "30 Sept 2026",
    color: "#f59e0b",
    description: "Budgeting is live for Pro and Power users. Your financial story unlocks after 7 days and 20 transactions.",
    features: [
        { text: "Budget — set monthly category caps, track spending in real time" },
        { text: "Manage Categories — add, edit and delete your own categories from Home" },
        { text: "Your Story — heatmap, records, and spending patterns (unlocks with history)" },
        { text: "Add Transaction now respects active budget limits" },
        { text: "Manage Savings now open to all users, not just paid plans" },
        { text: "Charts page — cleaner current month net balance layout" },
        { text: "Balance fix — set and adjust your balance now reflects correctly" },
        { text: "Refresh button on balance card (beta)" },
        { text: "New background on Landing, Login, and Sign Up screens" },
    ]
},
    {
        name: "In-App Notifications",
        version: "v1.4.0",
        date: "21 Sept 2026",
        color: "#995000",
        description: "Managed to learn and develop Apple's Dynamic Island - expanded ",
        features: [
            { text: "Pushes Notifiction on each update" },
            { text: "Modification of Artha Tutorial Bug"},
            { text: "Prepared it for future In-App Notification"}
        ]
    },    
    {
        name: "Bug Fixes",
        version: "v1.3.1",
        date: "21 Sept 2026",
        color: "gray",
        description: "Fixed bugs on daily spending chart in charts page - where the daily spendings were in descending order on safari based browsers",
        features: [
            { text: "Bugs on charts page fixed" },
            { text: "Fixed the update logs in profile page to make it look cooler"},
            { text: "Refurbished Manage Transaction Modal"}

            // { text: "Loading screen — branded loader with live status messages" },
            // { text: "Manual balance mode — override the calculated balance" },
        ]
    },
    {
        name: "Savings & PWA",
        version: "v1.3.0",
        date: "18 Sept 2026",
        color: "#10b981",
        description: "Artha now installs like a native app and updates itself silently. Savings goals are live for Plus and above.",
        features: [
            { text: "Savings Goals — set a target, pick an icon and color, log progress" },
            { text: "PWA auto-update — deploys reach your phone within 60 seconds" },
            { text: "Loading screen — branded loader with live status messages" },
            { text: "Manual balance mode — override the calculated balance" },
        ]
    },
    {
        name: "Onboarding tour",
        version: "v1.2.0",
        date: "10 Sept 2026",
        color: "#f59e0b",
        description: "First-time users get a guided walkthrough of every key feature. Replayable from Profile.",
        features: [
            { text: "13-step Driver.js tour across Home, AI, Charts, and Profile" },
            { text: "Replay from Profile → Support → Artha Tutorial" },
            { text: "Tour completion stored server-side, shows once per account" },
            { text: "Removed Upload Statement for further modification and testing" },
        ]
    },
    {
        name: "AI & subscription",
        version: "v1.1.0",
        date: "4 Sept 2026",
        color: "#3b82f6",
        description: "Artha AI launched with per-plan limits and model scaling. Razorpay payments wired in.",
        features: [
            { text: "Artha AI — reads your actual transaction data to answer finance questions" },
            { text: "Plan tiers — Free, Plus, Pro, Power with daily limits" },
            { text: "Razorpay integration — upgrade directly inside the app" },
            { text: "Category sorter — bulk-categorize transactions in one session" },
        ]
    },
    {
        name: "Foundation",
        version: "v1.0.0",
        date: "28 Aug 2026",
        color: "#e879f9",
        description: "Core app shipped. Auth, transactions, charts, bank statement upload.",
        features: [
            { text: "Auth — JWT-based login and registration" },
            { text: "Transactions — manual logging, edit, delete, filters, sort" },
            { text: "Charts — spending trend, category breakdown, top merchants" },
            { text: "Bank statement upload — CSV parsing for 16+ Indian banks" },
        ]
    },
]

export default function Changelog({ onClose }) {
    return (
        <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
            onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="overflow-y-auto rounded-3xl px-5 pt-4 pb-12 "
                style={{ width: '90vw', height: '75vh', marginBottom: '60px', scrollbarWidth: 'none', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)' }}
                onClick={e => e.stopPropagation()}>

                <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-4xl font-bold">Artha</p>
                        <p className="text-zinc-600 text-xs tracking-widest uppercase mt-1">Changelog</p>
                    </div>
                    <button onClick={onClose}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-zinc-400 text-sm">✕</span>
                    </button>
                </div>

                {UPDATES.map((u, i) => (
                    <div key={u.version}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-white text-lg font-semibold">{u.name}</p>
                                <p className="text-xs font-medium mt-0.5" style={{ color: u.color }}>{u.version}</p>
                            </div>
                            <p className="text-zinc-600 text-xs mt-1">{u.date}</p>
                        </div>

                        <p className="text-zinc-500 text-sm leading-relaxed mb-4">{u.description}</p>

                        <div className="flex flex-col gap-2.5 mb-6">
                            {u.features.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 "
                                        style={{ background: u.color }} />
                                    <p className="text-zinc-400 text-sm leading-relaxed">{f.text}</p>
                                </div>
                            ))}
                        </div>

                        {i < UPDATES.length - 1 && (
                            <hr className="border-none border-t border-zinc-900 mb-6" />
                        )}
                    </div>
                ))}
            </motion.div>
        </motion.div>
    )
}