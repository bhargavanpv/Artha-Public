import { useEffect, useState } from 'react'  
import AddTransaction from '../components/AddTransaction'
import BottomNav from '../components/BottomNav'
import CategorySorter from "../components/CategorySorter"
import ManageTransactions from '../components/ManageTransactions'
import { useData } from "../context/DataContext"
import ManageSavings from '../components/ManageSavings'
import { useNavigate } from 'react-router-dom'
import NewBadge from '../components/NewBadge'
import UnlockedBadge from '../components/UnlockedBadge'
import ManageCategories from '../components/ManageCategories'
import { motion, AnimatePresence } from 'framer-motion'

import {
    Shell,
    Plane,
    Plus,
    Home as HomeIcon,
    Car,
    Smartphone,
    ShoppingBag,
    GraduationCap,
    Laptop,
    Watch,
    Wallet,
    Target,
    Umbrella,
    Gift,
    Lock,
    Clapperboard
} from 'lucide-react'

function CircleProgress({ percent, size = 38, stroke = 4, color = '#6366f1' }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (Math.min(percent, 100) / 100) * circ

    return (
        <svg
            width={size}
            height={size}
            style={{
                transform: 'rotate(-90deg)',
                flexShrink: 0
            }}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
            />

            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
            />

            <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                    transform: 'rotate(90deg)',
                    transformOrigin: `${size / 2}px ${size / 2}px`
                }}
                fill="white"
                fontSize="10"
                fontWeight="700"
            >
                {Math.round(percent)}%
            </text>
        </svg>
    )
}

function Home() {
    
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false)
    
    const [showAdd, setShowAdd] = useState(false)
    const [showSorter, setShowSorter] = useState(false)
    const [showManageTransaction, setShowManageTransactions] = useState(false)
    const [showSavings, setShowSavings] = useState(false)

    const { transactions, stats, user, refreshData, savings, refreshSavings,activeBudget  } = useData()

    const [showCategories, setShowCategories] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % SAMPLE.length), 1400)
        return () => clearInterval(t)
    }, [])

    
    
    const now = new Date()
    const date = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const SAMPLE = ['Food', 'Travel', 'Rent', 'Fun']
    const [idx, setIdx] = useState(0)

    const SAVING_ICONS = {
        target: Target,
        movie: Clapperboard,
        plane: Plane,
        home: HomeIcon,
        car: Car,
        phone: Smartphone,
        bag: ShoppingBag,
        grad: GraduationCap,
        laptop: Laptop,
        watch: Watch,
        wallet: Wallet,
        umbrella: Umbrella,
        gift: Gift,
    }

    const spent = stats?.['Total Spent This Month'] || 0
    const income = stats?.['Total Income This Month'] || 0
    const balance = user?.hasSetBalance
        ? (user?.manualBalance || 0) + (stats?.netCashFlowFromDate || 0)
        : (stats?.netCashFlow || 0)
    const isLargeBalance = balance.toLocaleString('en-IN').length > 3
    const uncategorized = transactions.filter(t => t.category === 'Uncategorized')
    const isFree = user?.plan === 'free' || !user?.plan
    const canUseBudget = user?.plan === 'pro' || user?.plan === 'power'

    return (
        <div className="min-h-screen bg-black text-white pb-28 px-4">

            {/* Sticky Header */}
            <div className={`sticky top-0 z-50 flex justify-between items-center pr-2 py-3 px-1 transition-all duration-300 ${
                scrolled
                    ? 'backdrop-blur-md bg-black/80 border-b border-white/5'
                    : 'bg-transparent border-b border-transparent'
            }`}>
                <div>
                    <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-semibold text-2xl">{user?.name || ""}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{date}</p>
                </div>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-bold text-4xl tracking-tight">Artha</p>
            </div>

            {/* Balance Card */}
            <div data-tour="balance-card" className="rounded-3xl p-6 mt-2 mb-3"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                <p className="text-zinc-500 text-xs tracking-widest uppercase mb-2">Current Balance</p>

                {isLargeBalance ? (
                    <>
                        <p className="text-5xl font-bold tracking-tight mb-5 whitespace-nowrap"
                            style={{ color: balance < 0 ? '#ef4444' : 'white' }}>
                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-zinc-500 text-xs">Spent</p>
                                <p className="text-red-400 font-semibold text-sm">↓ ₹{spent.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs">Income</p>
                                <p className="text-emerald-400 font-semibold text-sm">↑ ₹{income.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-between items-center gap-3 mb-4">
                        <p className="text-6xl font-bold tracking-tight"
                            style={{ color: balance < 0 ? '#ef4444' : 'white' }}>
                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex flex-col gap-3 items-end">
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs">Spent</p>
                                <p className="text-red-400 font-semibold text-sm">↓ ₹{spent.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs">Income</p>
                                <p className="text-emerald-400 font-semibold text-sm">↑ ₹{income.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* <div className="flex justify-between text-xs pt-3 border-t border-white/5">
                    <div className="flex gap-2">
                        <span className="text-emerald-400">↑ ₹{income.toLocaleString('en-IN')} in</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-red-400">↓ ₹{spent.toLocaleString('en-IN')} out</span>
                    </div>
                    <span className="text-zinc-700">*this month</span>
                </div> */}
            </div>

            {/* Recent Transactions */}
            <div data-tour="recent-transactions" className="rounded-2xl p-4 mt-3"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-zinc-400 text-xs font-medium tracking-widest uppercase">Recent Transactions</h2>
                    <div className="flex items-center gap-2">
                        
                        <button onClick={() => setShowManageTransactions(true)}
                            className="cursor-pointer ease-in active:text-white transition-all duration-100">
                            <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase">See all</span>
                        </button>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <p className="text-zinc-600 text-sm text-center py-4">No transactions yet</p>
                ) : (
                    <div className="flex flex-col ">
                        {transactions.slice(0, 5).map((t) => (
                            <div key={t._id} onClick={()=> {setShowManageTransactions(true)}} className="flex items-center border-y-1 py-2 border-zinc-900 justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: t.type === 'credit' ? '#10b981' : '#ef4444' }} />
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium leading-tight truncate max-w-[180px]">{t.description}</p>
                                        <p className="text-zinc-600 text-xs mt-0.5">{t.category}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-semibold flex-shrink-0 ${t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                         
                        ))}
                    </div>
                )}
            </div>

            {/* Review Needed */}
            {uncategorized.length > 0 && (
                <div className="rounded-2xl p-4 mt-3 mb-3"
                    style={{ background: '#111111', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-400 text-sm">⚠</span>
                        <h2 className="text-amber-400 text-xs font-medium tracking-widest uppercase">Review Needed</h2>
                    </div>
                    <p className="text-zinc-500 text-xs mb-3">{uncategorized.length} transactions need a category</p>
                    <button onClick={() => setShowSorter(true)} className="text-xs text-amber-400 font-medium">Categorize now →</button>
                </div>
            )}

            <AnimatePresence>
                {showSorter && (
                    <CategorySorter onComplete={() => {
                        setShowSorter(false)
                        refreshData()
                    }} />
                )}
            </AnimatePresence>

            {/* Grid — Savings + Budget */}
            <div className="grid grid-cols-2 w-full max-w-xl mx-auto gap-3 my-3">

                {/* Savings tile */}
                <div
                    onClick={() => { setShowSavings(true) }}
                    className="bg-[#111111] rounded-2xl h-60 flex flex-col p-4 transition-all"
                    style={{
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        minHeight: '140px'
                    }}
                >
                    <div className="flex items-center relative justify-between mb-6">
                        <h2 className="text-zinc-400 text-[12px] font-semibold tracking-widest uppercase">Savings</h2>

                    </div>
                    
                    {!savings || savings.length === 0 ? (
                        <motion.div
                            className="flex-1 flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
<div className="relative w-16 h-16 mb-5">

    {/* Center icon */}
    <motion.div
        animate={{
            scale: [1, 1.05, 1],
            opacity: [0.65, 1, 0.65]
        }}
        transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
        }}
        className="absolute inset-0 flex items-center justify-center"
    >
        <Shell
            size={25}
            strokeWidth={2}
            className="text-indigo-400"
        />
    </motion.div>

    {/* Orbiting dots */}
    {[0, 1, 2, 3,].map((i) => (
        <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-300"
            style={{
                top: '50%',
                left: '50%',
                marginTop: -3,
                marginLeft: -3
            }}
            animate={{ rotate: 360 }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 2
            }}
            transformTemplate={({ rotate }) =>
                `rotate(${rotate}) translateX(27px) rotate(-${rotate})`
            }
        />
    ))}
</div>

                        {/* Premium Savings Text */}
                        <div className="text-center">

                            <motion.p
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="text-white text-[16px] font-medium tracking-wide"
                            >
                                Start saving
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                                className="text-zinc-500 text-[12px] mt-1 tracking-wide"
                            >
                                toward something meaningful
                            </motion.p>


                        </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-5 flex-1">
                            {savings.slice(0, 3).map(s => {
                                const percent = s.targetAmount > 0 ? (s.savedAmount / s.targetAmount) * 100 : 0
                                const color = s.completed ? '#10b981' : (s.color || '#6366f1')
                                const Icon = SAVING_ICONS[s.iconKey] || Target
                                return (
                                    <div key={s._id} className="flex items-center gap-2">
                                        <Icon size={18} color={color} strokeWidth={2} className="flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-[11px] max-w-auto font-medium truncate">{s.name}</p>
                                            <div className="w-full h-1 rounded-full bg-white/5 mt-1 overflow-hidden">
                                                <div className="h-full rounded-full"
                                                    style={{ width: `${Math.min(percent, 100)}%`, background: color }} />
                                            </div>
                                        </div>
                                        <p className="text-[12px] font-semibold flex-shrink-0" style={{ color }}>
                                            {Math.round(percent)}%
                                        </p>
                                    </div>
                                )
                            })}
                            {savings.length > 3 && (
                                <p className="text-zinc-700 text-center text-[12px]">+{savings.length - 3} more goals</p>
                            )}
                        </div>
                    )}
                </div>


                {/* Budget tile */}
                <div
                    onClick={() => { if (canUseBudget) navigate('/budget') }}
                    className="bg-[#111111] rounded-2xl relative flex flex-col p-4 transition-all active:scale-[0.97]"
                    style={{
                        border: activeBudget && canUseBudget
                            ? '1px solid rgba(99,102,241,0.25)'
                            : '1px solid rgba(255,255,255,0.06)',
                        cursor: canUseBudget ? 'pointer' : 'default',
                        minHeight: '140px'
                    }}
                >
                    {/* 1. Budget Header */}
                    <div className="flex items-center relative justify-between mb-3">
                        <NewBadge />
                        <h2 className="text-zinc-400 text-[12px] font-semibold tracking-widest uppercase">
                            Budget
                        </h2>
                    </div>

                    {/* 2. Locked — Free Plan */}
                    {!canUseBudget ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                            <Lock size={28} className="text-zinc-700" />

                            <p className="text-zinc-700 text-[12px] leading-tight">
                                Artha Pro & Power
                            </p>
                        </div>

                    /* 3. No Active Budget */
                    ) : !activeBudget ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 mb-8 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}
                            >
                                <Plus size={20} className="text-zinc-500" strokeWidth={2} />
                            </div>
                            <p className="text-white text-[16px] text-center leading-tight tracking-wide">
                                No budget set
                            </p>
                            <p className='text-zinc-600 text-[12px] text-center leading-tight tracking-wide'>
                                Start Your First Budget
                            </p>
                        </div>

                    /* 4. Active Budget */
                    ) : (
                        <div className="flex-1 flex flex-col justify-between">

                            {/* Mini ring + spent */}
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">

                                    <svg
                                        width="44"
                                        height="44"
                                        style={{ transform: 'rotate(-90deg)' }}
                                    >
                                        <circle
                                            cx="22"
                                            cy="22"
                                            r="18"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeWidth="3.5"
                                        />

                                        <circle
                                            cx="22"
                                            cy="22"
                                            r="18"
                                            fill="none"
                                            stroke={
                                                activeBudget.totalSpent > activeBudget.totalAllocated
                                                    ? '#ef4444'
                                                    : '#6366f1'
                                            }
                                            strokeWidth="3.5"
                                            strokeDasharray={2 * Math.PI * 18}
                                            strokeDashoffset={
                                                2 * Math.PI * 18 *
                                                (1 - Math.min(
                                                    activeBudget.totalSpent /
                                                    (activeBudget.totalAllocated || 1),
                                                    1
                                                ))
                                            }
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <p className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">
                                        {Math.round(
                                            (activeBudget.totalSpent /
                                                (activeBudget.totalAllocated || 1)) * 100
                                        )}%
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white text-sm font-bold leading-tight">
                                        ₹{activeBudget.totalSpent.toLocaleString('en-IN')}
                                    </p>

                                    <p className="text-zinc-600 text-[10px]">
                                        spent
                                    </p>
                                </div>
                            </div>

                            {/* Remaining */}
                            <div>
                                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mb-1.5">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                (activeBudget.totalSpent /
                                                    (activeBudget.totalAllocated || 1)) * 100,
                                                100
                                            )}%`,
                                            background:
                                                activeBudget.totalSpent >
                                                activeBudget.totalAllocated
                                                    ? '#ef4444'
                                                    : '#6366f1'
                                        }}
                                    />
                                </div>

                                <div className='flex justify-between gap-3 items-center h-10'>
                                    <p className="text-zinc-600 text-[12px]">
                                        ₹{Math.max(
                                            0,
                                            activeBudget.totalAllocated -
                                            activeBudget.totalSpent
                                        ).toLocaleString('en-IN')} left
                                    </p>
                                    {activeBudget && canUseBudget && (
                                        <span
                                            className="text-[11px] px-1.5 py-0.5 rounded-md text-blue-400"
                                            style={{ background: 'rgba(99,102,241,0.1)' }}
                                        >
                                            Active
                                        </span>
                                    )}
                                </div>
                                
                                </div>

                        </div>
                    )}
                </div>

                
            </div>
            {/* Manage Categories */}
                <div
                    className="bg-[#111111] rounded-2xl h-50 flex flex-col p-4 transition-all"
                    style={{
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: isFree ? 'default' : 'pointer',
                        minHeight: '140px'
                    }}
                >
                    <div className="flex items-center relative justify-between mb-3">
                        <NewBadge />
                        <h2 className="text-zinc-400 text-[12px] font-semibold tracking-widest uppercase">
                            Categories
                        </h2>
                    </div>
                    
                    <button
                        onClick={() => setShowCategories(true)}
                        className="text-zinc-600 text-xs h-full w-full rounded-xl transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        Manage Your Categories
                    </button>
                </div>

            <BottomNav onAddClick={() => setShowAdd(true)} />

            <ManageSavings
                isOpen={showSavings}
                onClose={() => setShowSavings(false)}
                onUpdate={refreshSavings}
            />

            <AddTransaction
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                onSuccess={refreshData}
                onBudgetExceeded={(cat, overBy) => {
                    // you can wire up an in-app notification here later
                    // for now a console log or ignore — Home doesn't have toast yet
                }}
            />

            {showCategories && (
                <ManageCategories
                    isOpen={showCategories}
                    onClose={() => setShowCategories(false)}
                />
            )}
        

            {showManageTransaction && (
                <ManageTransactions
                    onUpdate={refreshData}
                    onClose={() => setShowManageTransactions(false)}
                />
            )}
        </div>
    )
}

export default Home