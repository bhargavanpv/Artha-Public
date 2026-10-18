// src/pages/Budget.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
    Plus, ChevronRight, ChevronLeft, X, Eye, EyeOff,
    CheckCircle, RotateCcw, Wallet, Zap, PieChart,
    ShieldCheck, BarChart2, TrendingDown, Pencil, Trash2,
    TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import api from '../api/axios'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import AddTransaction from '../components/AddTransaction'
import CategoryPicker from '../components/CategoryPicker'

const MONTH_NAMES = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']

function getDefaultMonth() {
    const now = new Date()
    if (now.getDate() > 15) {
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        return { month: next.getMonth(), year: next.getFullYear() }
    }
    return { month: now.getMonth(), year: now.getFullYear() }
}

function getCategoryColor(spent, limit) {
    if (!limit) return '#6366f1'
    const pct = spent / limit
    if (pct >= 1) return '#ef4444'
    if (pct >= 0.8) return '#f59e0b'
    return '#10b981'
}

function ProgressBar({ spent, limit, height = 6 }) {
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
    const color = getCategoryColor(spent, limit)
    return (
        <div className="w-full rounded-full bg-white/[0.06] overflow-hidden" style={{ height }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full"
                style={{
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    boxShadow: `0 0 10px ${color}60, 0 0 20px ${color}20`
                }}
            />
        </div>
    )
}

function Toast({ message }) {
    return (
        <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl text-sm text-white whitespace-nowrap"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        >
            {message}
        </motion.div>
    )
}

function SwipeableCategoryRow({ alloc, spent: spentAmt, onDelete }) {
    const x = useMotionValue(0)
    const deleteOpacity = useTransform(x, [-80, -30], [1, 0])
    const color = getCategoryColor(spentAmt, alloc.limit)
    const pct = alloc.limit > 0 ? Math.round((spentAmt / alloc.limit) * 100) : 0
    const isOver = spentAmt > alloc.limit
    const isWarning = pct >= 80 && !isOver

    return (
        <div className="relative overflow-hidden">
            <motion.div style={{ opacity: deleteOpacity }}
                className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                <button onClick={onDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-400 font-medium"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 size={11} /> Remove
                </button>
            </motion.div>
            <motion.div
                drag="x" dragConstraints={{ left: -90, right: 0 }} dragElastic={0.08}
                style={{ x, background: isOver ? 'rgba(239,68,68,0.03)' : 'transparent' }}
                className="px-4 py-4 border-b border-white/[0.04] last:border-0 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
                        <p className="text-white text-sm font-semibold">{alloc.category}</p>
                        {isOver && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-red-400"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                Over
                            </span>
                        )}
                        {isWarning && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-amber-400"
                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                {pct}%
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-white text-sm font-bold">₹{spentAmt.toLocaleString('en-IN')}</p>
                        <p className="text-zinc-600 text-[10px]">of ₹{alloc.limit.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <ProgressBar spent={spentAmt} limit={alloc.limit} height={6} />
                <div className="flex justify-between mt-1.5">
                    <p className="text-zinc-700 text-[9px]">← swipe to remove</p>
                    <p className="text-[10px] font-medium" style={{ color }}>{pct}% used</p>
                </div>
            </motion.div>
        </div>
    )
}

function UnallocatedDisplay({ unallocated, income }) {
    const pct = income > 0 ? Math.round((unallocated / income) * 100) : 0
    const color = pct >= 20 ? '#10b981' : pct >= 10 ? '#f59e0b' : '#ef4444'
    const label = pct >= 20 ? 'Great savings rate' : pct >= 10 ? 'Could save more' : 'Tight budget'
    if (!income || unallocated <= 0) return null

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl p-4 relative overflow-hidden"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl"
                style={{ background: `${color}15` }} />
            <div className="flex items-center justify-between relative">
                <div>
                    <p className="text-zinc-500 text-xs mb-1">Unallocated · implicit savings</p>
                    <p className="text-white text-2xl font-bold tracking-tight">₹{unallocated.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <p className="text-xs font-semibold" style={{ color }}>{label}</p>
                    </div>
                </div>
                <div className="relative flex items-center justify-center">
                    <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <motion.circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 26}
                            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - pct / 100) }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                        />
                    </svg>
                    <p className="absolute text-white text-sm font-bold">{pct}%</p>
                </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: `${100 - pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-l-full bg-indigo-500/70" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-r-full"
                    style={{ background: color }} />
            </div>
            <div className="flex justify-between mt-1">
                <p className="text-zinc-600 text-[9px]">Allocated {100 - pct}%</p>
                <p className="text-[9px] font-semibold" style={{ color }}>Saved {pct}%</p>
            </div>
        </motion.div>
    )
}

// ─── Past Budget Detail Modal ─────────────────────────────────────────────────
function PastBudgetModal({ budget: b, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/budget/${b._id}`)
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [b._id])

    if (loading) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.88)' }} onClick={onClose}>
            <div className="w-full rounded-t-3xl px-5 pt-5 pb-12 flex items-center justify-center h-48"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-zinc-600 text-sm">Loading report...</p>
            </div>
        </motion.div>
    )

    if (!data) return null

    const totalSpent = data.totalSpent || 0
    const totalAllocated = data.totalAllocated || 0
    const incomeExpected = data.incomeExpected || 0
    const incomeActual = data.incomeActual || 0
    const savedVsBudget = Math.max(0, totalAllocated - totalSpent)
    const savedVsIncome = Math.max(0, incomeActual - totalSpent)
    const overBudget = totalSpent > totalAllocated
    const pctUsed = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0
    const insights = data.insights || {}

    // Generate verdict sentence
    const getVerdict = () => {
        if (overBudget) return `You went over budget by ₹${(totalSpent - totalAllocated).toLocaleString('en-IN')}. Happens — the data tells you where.`
        if (pctUsed <= 60) return `You used only ${pctUsed}% of your budget. Either you set it too high, or this was a genuinely quiet month.`
        if (pctUsed <= 85) return `Solid month. You stayed under budget and had room to breathe.`
        return `You cut it close — ${pctUsed}% used — but stayed within budget. That counts.`
    }

    // Top overspent category
    const topOverCategory = data.allocations
        ?.map(a => ({ ...a, spent: data.spent?.[a.category] || 0 }))
        .filter(a => a.spent > a.limit)
        .sort((a, b) => (b.spent - b.limit) - (a.spent - a.limit))[0]

    // Most under category
    const topUnderCategory = data.allocations
        ?.map(a => ({ ...a, spent: data.spent?.[a.category] || 0 }))
        .filter(a => a.spent < a.limit && a.spent > 0)
        .sort((a, b) => (a.spent / a.limit) - (b.spent / b.limit))[0]

    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const busiestDay = insights.byDow
        ? DOW[insights.byDow.indexOf(Math.max(...insights.byDow))]
        : null

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}>
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full rounded-t-3xl px-5 pt-5 pb-12"
                style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.07)',
                    maxHeight: '88vh', overflowY: 'auto', scrollbarWidth: 'none'
                }}>
                <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mb-5" />

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-zinc-500 text-xs tracking-widest uppercase">{MONTH_NAMES[b.month]} {b.year}</p>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-2xl font-bold mt-0.5">{b.name}</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <X size={13} className="text-zinc-400" />
                    </button>
                </div>

                {/* Verdict card */}
                <div className="rounded-2xl p-4 mb-4"
                    style={{
                        background: overBudget ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
                        border: `1px solid ${overBudget ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                    }}>
                    <p className="text-white text-sm font-semibold mb-1">
                        {overBudget ? '⚠ Over budget' : '✓ Budget kept'}
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">{getVerdict()}</p>
                </div>

                {/* Big numbers */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-2xl p-4"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-500 text-xs mb-1">Total spent</p>
                        <p className="text-white text-xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
                        <p className="text-zinc-600 text-[10px] mt-0.5">of ₹{totalAllocated.toLocaleString('en-IN')} budget</p>
                        <ProgressBar spent={totalSpent} limit={totalAllocated} height={4} />
                    </div>
                    <div className="rounded-2xl p-4"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-500 text-xs mb-1">Saved</p>
                        <p className="text-emerald-400 text-xl font-bold">
                            ₹{savedVsBudget.toLocaleString('en-IN')}
                        </p>
                        <p className="text-zinc-600 text-[10px] mt-0.5">vs budget allocation</p>
                        {incomeActual > 0 && (
                            <p className="text-zinc-500 text-[10px] mt-1">
                                ₹{savedVsIncome.toLocaleString('en-IN')} vs actual income
                            </p>
                        )}
                    </div>
                </div>

                {/* Income: expected vs actual */}
                {incomeExpected > 0 && (
                    <div className="rounded-2xl p-4 mb-4"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase mb-3">Income</p>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="text-zinc-500 text-xs">Expected</p>
                                <p className="text-white text-lg font-bold">₹{incomeExpected.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs">Received</p>
                                <p className="text-emerald-400 text-lg font-bold">₹{incomeActual.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        {incomeActual >= incomeExpected ? (
                            <p className="text-emerald-400 text-xs">
                                ↑ ₹{(incomeActual - incomeExpected).toLocaleString('en-IN')} more than expected
                            </p>
                        ) : (
                            <p className="text-amber-400 text-xs">
                                ↓ ₹{(incomeExpected - incomeActual).toLocaleString('en-IN')} less than expected
                            </p>
                        )}
                    </div>
                )}

                {/* Insights in plain language */}
                {(topOverCategory || topUnderCategory || busiestDay || insights.biggestTxn) && (
                    <div className="rounded-2xl p-4 mb-4"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase mb-3">What the data says</p>
                        <div className="flex flex-col gap-3">
                            {topOverCategory && (
                                <div className="flex items-start gap-3">
                                    <span className="text-red-400 text-sm mt-0.5">↑</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        <span className="text-white font-semibold">{topOverCategory.category}</span> was your biggest slip —
                                        you spent ₹{topOverCategory.spent.toLocaleString('en-IN')} against a ₹{topOverCategory.limit.toLocaleString('en-IN')} limit.
                                        That's ₹{(topOverCategory.spent - topOverCategory.limit).toLocaleString('en-IN')} over.
                                    </p>
                                </div>
                            )}
                            {topUnderCategory && (
                                <div className="flex items-start gap-3">
                                    <span className="text-emerald-400 text-sm mt-0.5">↓</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        <span className="text-white font-semibold">{topUnderCategory.category}</span> was your best category —
                                        only {Math.round((topUnderCategory.spent / topUnderCategory.limit) * 100)}% used.
                                        You had ₹{(topUnderCategory.limit - topUnderCategory.spent).toLocaleString('en-IN')} to spare.
                                    </p>
                                </div>
                            )}
                            {busiestDay && (
                                <div className="flex items-start gap-3">
                                    <span className="text-amber-400 text-sm mt-0.5">📅</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        You spend the most on <span className="text-white font-semibold">{busiestDay}s</span>.
                                        Something to watch next month.
                                    </p>
                                </div>
                            )}
                            {insights.biggestTxn && (
                                <div className="flex items-start gap-3">
                                    <span className="text-indigo-400 text-sm mt-0.5">⚡</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        Biggest single expense: <span className="text-white font-semibold">
                                            {insights.biggestTxn.description}
                                        </span> at ₹{insights.biggestTxn.amount.toLocaleString('en-IN')}.
                                    </p>
                                </div>
                            )}
                            {insights.avgDailySpend > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="text-zinc-400 text-sm mt-0.5">~</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        Average daily spend was <span className="text-white font-semibold">
                                            ₹{insights.avgDailySpend.toLocaleString('en-IN')}/day
                                        </span>.
                                        {totalAllocated > 0 && (() => {
                                            const daysInMonth = new Date(b.year, b.month + 1, 0).getDate()
                                            const targetDaily = Math.round(totalAllocated / daysInMonth)
                                            const diff = insights.avgDailySpend - targetDaily
                                            return diff > 0
                                                ? ` That's ₹${diff.toLocaleString('en-IN')} above your daily target.`
                                                : ` That's ₹${Math.abs(diff).toLocaleString('en-IN')} below your daily target — good.`
                                        })()}
                                    </p>
                                </div>
                            )}
                            {insights.firstHalf > 0 && insights.secondHalf > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="text-zinc-400 text-sm mt-0.5">↔</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                        {insights.firstHalf > insights.secondHalf
                                            ? `You spent more in the first half (₹${insights.firstHalf.toLocaleString('en-IN')}) than the second (₹${insights.secondHalf.toLocaleString('en-IN')}). Front-loaded month.`
                                            : `You spent more in the second half (₹${insights.secondHalf.toLocaleString('en-IN')}) than the first (₹${insights.firstHalf.toLocaleString('en-IN')}). Spending built up as the month went on.`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category breakdown */}
                {data.allocations?.length > 0 && (
                    <div className="rounded-2xl overflow-hidden mb-4"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase px-4 pt-4 pb-3">
                            Category breakdown
                        </p>
                        {data.allocations.map(alloc => {
                            const spent = data.spent?.[alloc.category] || 0
                            const color = getCategoryColor(spent, alloc.limit)
                            const pct = alloc.limit > 0 ? Math.round((spent / alloc.limit) * 100) : 0
                            return (
                                <div key={alloc.category} className="px-4 py-3 border-b border-white/[0.04] last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                            <p className="text-white text-sm font-medium">{alloc.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white text-sm font-bold">₹{spent.toLocaleString('en-IN')}</p>
                                            <p className="text-zinc-600 text-[10px]">of ₹{alloc.limit.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <ProgressBar spent={spent} limit={alloc.limit} height={4} />
                                    <p className="text-[10px] mt-1 font-medium" style={{ color }}>{pct}% used</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}

// ─── Create / Edit Budget Modal ───────────────────────────────────────────────
function CreateBudgetModal({ onClose, onCreated, existingCategories, previousBudget, editingBudget }) {
    const def = getDefaultMonth()
    const [step, setStep] = useState(1)
    const [name, setName] = useState(editingBudget?.name || `${MONTH_NAMES[def.month]} ${def.year} Budget`)
    const [month, setMonth] = useState(editingBudget?.month ?? def.month)
    const [year, setYear] = useState(editingBudget?.year ?? def.year)
    const [income, setIncome] = useState(editingBudget?.incomeExpected ? String(editingBudget.incomeExpected) : '')
    const [allocations, setAllocations] = useState(() => {
        if (editingBudget) {
            const m = {}
            editingBudget.allocations.forEach(a => { m[a.category] = a.limit })
            return m
        }
        return {}
    })
    const [saving, setSaving] = useState(false)
    const [activeCategories, setActiveCategories] = useState(() => {
        const base = existingCategories.filter(c => c.type === 'expense' || !c.type).map(c => c.name)
        const fromBudget = editingBudget ? editingBudget.allocations.map(a => a.category) : []
        return [...new Set([...base, ...fromBudget])]
    })
    const [showAddCat, setShowAddCat] = useState(false)
    const [newCatInput, setNewCatInput] = useState('')

    const totalAllocated = Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0)
    const unallocated = Math.max(0, (Number(income) || 0) - totalAllocated)

    const handleCopyPrevious = () => {
        if (!previousBudget) return
        const copied = {}
        previousBudget.allocations.forEach(a => { copied[a.category] = a.limit })
        setAllocations(copied)
        if (previousBudget.incomeExpected) setIncome(String(previousBudget.incomeExpected))
        const cats = [...new Set([...activeCategories, ...previousBudget.allocations.map(a => a.category)])]
        setActiveCategories(cats)
        setStep(2)
    }

    const handleCreate = async () => {
        setSaving(true)
        try {
            const allocationArray = Object.entries(allocations)
                .filter(([, v]) => v && Number(v) > 0)
                .map(([category, limit]) => ({ category, limit: Number(limit) }))
            if (editingBudget) {
                await api.put(`/budget/${editingBudget._id}`, {
                    name, month, year,
                    incomeExpected: Number(income) || 0,
                    allocations: allocationArray,
                })
            } else {
                await api.post('/budget', {
                    name, month, year,
                    incomeExpected: Number(income) || 0,
                    allocations: allocationArray,
                })
            }
            onCreated()
        } catch (err) {
            console.error(err)
            alert(err.response?.data?.message || 'Failed to create budget. A budget for this month may already exist.')
        } finally {
            setSaving(false)
        }
    }

    const monthOptions = []
    for (let i = 0; i < 6; i++) {
        const d = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1)
        monthOptions.push({ month: d.getMonth(), year: d.getFullYear() })
    }

    const removeCategory = (catName) => {
        setActiveCategories(prev => prev.filter(c => c !== catName))
        setAllocations(prev => { const n = { ...prev }; delete n[catName]; return n })
    }

    const addCustomCategory = () => {
        const t = newCatInput.trim()
        if (!t) return
        if (!activeCategories.includes(t)) setActiveCategories(prev => [...prev, t])
        setNewCatInput('')
        setShowAddCat(false)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}>
            <motion.div
                initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full rounded-t-3xl px-5 pt-5 pb-36"
                style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    maxHeight: '92vh', overflowY: 'auto', scrollbarWidth: 'none',
                }}>
                <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mb-5" />
                <div className="flex items-center gap-2 mb-6">
                    {[1,2,3].map(s => (
                        <div key={s} className="h-1 flex-1 rounded-full transition-all duration-500"
                            style={{ background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.08)' }} />
                    ))}
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold mb-1">
                            {editingBudget ? 'Edit budget' : 'Name your budget'}
                        </p>
                        <p className="text-zinc-500 text-xs mb-6">Set a period and give it a name.</p>
                        <label className="text-zinc-500 text-xs mb-2 block">Budget month</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
                            {monthOptions.map(opt => {
                                const sel = opt.month === month && opt.year === year
                                return (
                                    <button key={`${opt.month}-${opt.year}`}
                                        onClick={() => {
                                            setMonth(opt.month); setYear(opt.year)
                                            if (!editingBudget) setName(`${MONTH_NAMES[opt.month]} ${opt.year} Budget`)
                                        }}
                                        className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            background: sel ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                            border: sel ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                            color: sel ? '#a5b4fc' : '#71717a'
                                        }}>
                                        {MONTH_NAMES[opt.month].slice(0,3)} {opt.year}
                                    </button>
                                )
                            })}
                        </div>
                        <label className="text-zinc-500 text-xs mb-2 block">Budget name</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white text-sm rounded-2xl px-4 py-3.5 outline-none mb-5"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                            placeholder="e.g. October 2026 Budget" />
                        {previousBudget && !editingBudget && (
                            <button onClick={handleCopyPrevious}
                                className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl mb-5 transition-all active:scale-95"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <RotateCcw size={13} className="text-zinc-500" />
                                <p className="text-zinc-400 text-sm">Copy from {MONTH_NAMES[previousBudget.month]}'s budget</p>
                            </button>
                        )}
                        <button onClick={() => setStep(2)} disabled={!name.trim()}
                            className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', opacity: !name.trim() ? 0.4 : 1 }}>
                            Next →
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold mb-1">Plan your money</p>
                        <p className="text-zinc-500 text-xs mb-5">Set income, then allocate per category.</p>
                        <label className="text-zinc-500 text-xs mb-2 block">Expected income this month</label>
                        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-2"
                            style={{ background: '#0a0a0a', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <span className="text-zinc-400 text-lg font-light">₹</span>
                            <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                                className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder:text-zinc-800"
                                placeholder="0" autoFocus />
                        </div>
                        <UnallocatedDisplay unallocated={unallocated} income={Number(income)} />
                        <p className="text-zinc-500 text-xs mt-5 mb-3">
                            Category limits <br /> <span className="text-zinc-700">Leave blank = no limit or highly flexible categories</span>
                        </p>
                        <div className="flex flex-col gap-2 mb-3">
                            <AnimatePresence>
                                {activeCategories.map(catName => (
                                    <motion.div key={catName}
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                                        <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
                                            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="flex items-center gap-2.5 flex-1">
                                                <button onClick={() => removeCategory(catName)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    <X size={9} className="text-red-400" />
                                                </button>
                                                <p className="text-white text-sm font-medium">{catName}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-600 text-xs">₹</span>
                                                <input type="number" value={allocations[catName] || ''}
                                                    onChange={e => setAllocations(prev => ({ ...prev, [catName]: e.target.value }))}
                                                    className="w-24 bg-zinc-900 text-white text-sm text-left rounded-xl px-3 py-1.5 outline-none"
                                                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                                                    placeholder="No limit" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <AnimatePresence>
                            {showAddCat ? (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mb-3">
                                    <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addCustomCategory()}
                                        className="flex-1 bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                                        style={{ border: '1px solid rgba(99,102,241,0.3)' }}
                                        placeholder="Category name" autoFocus />
                                    <button onClick={addCustomCategory}
                                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
                                        style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                        Add
                                    </button>
                                    <button onClick={() => setShowAddCat(false)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <X size={13} className="text-zinc-500" />
                                    </button>
                                </motion.div>
                            ) : (
                                <button onClick={() => setShowAddCat(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-zinc-500 mb-5 transition-all active:scale-95"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <Plus size={13} /> Add category to budget
                                </button>
                            )}
                        </AnimatePresence>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)}
                                className="w-12 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <ChevronLeft size={16} className="text-zinc-400" />
                            </button>
                            <button onClick={() => setStep(3)}
                                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                Review →
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold mb-1">Review</p>
                        <p className="text-zinc-500 text-xs mb-5">Looks good? {editingBudget ? 'Save changes.' : 'Activate your budget.'}</p>
                        <div className="rounded-2xl p-4 mb-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">{name}</p>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-zinc-400 text-sm">Expected income</p>
                                <p className="text-white text-sm font-bold">₹{(Number(income)||0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-zinc-400 text-sm">Total allocated</p>
                                <p className="text-white text-sm font-bold">₹{totalAllocated.toLocaleString('en-IN')}</p>
                            </div>
                            {income && (
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <p className="text-zinc-400 text-sm">Savings</p>
                                    <p className="text-emerald-400 text-sm font-bold">
                                        ₹{unallocated.toLocaleString('en-IN')}
                                        {' '}<span className="text-zinc-600 text-xs">
                                            ({Math.round((unallocated / Number(income)) * 100)}%)
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mb-5">
                            {Object.entries(allocations).filter(([, v]) => v && Number(v) > 0).map(([cat, limit]) => (
                                <div key={cat} className="flex justify-between items-center px-4 py-2.5 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <p className="text-zinc-300 text-sm">{cat}</p>
                                    <p className="text-white text-sm font-semibold">₹{Number(limit).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                            {Object.values(allocations).filter(v => v && Number(v) > 0).length === 0 && (
                                <p className="text-zinc-600 text-xs text-center py-3">No limits set — tracking without caps.</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)}
                                className="w-12 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <ChevronLeft size={16} className="text-zinc-400" />
                            </button>
                            <button onClick={handleCreate} disabled={saving}
                                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', opacity: saving ? 0.7 : 1 }}>
                                {saving ? '...' : editingBudget ? '✓ Save Changes' : '✓ Activate Budget'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}

// ─── Active dashboard ─────────────────────────────────────────────────────────
function ActiveDashboard({ budget, onEdit, onCreateNew, stats }) {
    const [showSavings, setShowSavings] = useState(false)
    const [localAllocations, setLocalAllocations] = useState(budget.allocations)
    const now = new Date()
    const isLastWeek = now.getMonth() === budget.month && now.getFullYear() === budget.year
        && (budget.daysInMonth - now.getDate()) <= 7

    const monthLabel = `${MONTH_NAMES[budget.month]} ${budget.year}`
    const totalPct = budget.totalAllocated > 0
        ? Math.round((budget.totalSpent / budget.totalAllocated) * 100) : 0
    const isUnder = budget.projectedSpend <= budget.totalAllocated
    const velocityText = budget.daysPassed > 0
        ? `Spending ₹${Math.round(budget.totalSpent / budget.daysPassed).toLocaleString('en-IN')}/day`
        : null

    // Actual income this month from stats
    const incomeActual = stats?.['Total Income This Month'] || 0
    const incomeExpected = budget.incomeExpected || 0

    const handleRemoveCategory = async (category) => {
        const updated = localAllocations.filter(a => a.category !== category)
        setLocalAllocations(updated)
        try {
            await api.put(`/budget/${budget._id}`, {
                name: budget.name, incomeExpected: budget.incomeExpected, allocations: updated,
            })
        } catch (err) { setLocalAllocations(budget.allocations) }
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-3xl p-5 relative overflow-hidden"
                style={{
                    background: '#111111',
                    border: '1px solid rgba(99,102,241,0.18)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.06)'
                }}>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                    style={{ background: 'rgba(99,102,241,0.08)' }} />

                <div className="flex items-start justify-between mb-1 relative">
                    <div>
                        <p className="text-zinc-500 text-xs tracking-widest uppercase">{monthLabel}</p>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-2xl font-bold mt-0.5">{budget.name}</p>
                    </div>
                    <button onClick={onEdit}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Pencil size={12} className="text-zinc-400" />
                    </button>
                </div>

                {/* Day progress */}
                <div className="mb-4 relative">
                    {budget.isUpcoming ? (
                        <div className="flex flex-col items-center justify-center py-4 rounded-2xl"
                            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                            <p className="text-indigo-400 font-bold" style={{ fontSize: '3rem', lineHeight: 1 }}>
                                {budget.daysUntilStart}
                            </p>
                            <p className="text-zinc-400 text-xs mt-1">days until budget starts</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-1.5">
                                <p className="text-zinc-600 text-[10px]">Day {budget.daysPassed} of {budget.daysInMonth}</p>
                                <p className="text-zinc-600 text-[10px]">{budget.daysInMonth - budget.daysPassed} days left</p>
                            </div>
                            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                <motion.div initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((budget.daysPassed / budget.daysInMonth) * 100)}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-indigo-500/60" />
                            </div>
                        </>
                    )}
                </div>

                {/* Spent + projection */}
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <p className="text-zinc-500 text-xs mb-1">Total spent</p>
                        <p className="text-white font-bold tracking-tight" style={{ fontSize: '2.75rem', lineHeight: 1 }}>
                            ₹{budget.totalSpent.toLocaleString('en-IN')}
                        </p>
                        <p className="text-zinc-600 text-xs mt-1.5">of ₹{budget.totalAllocated.toLocaleString('en-IN')} budgeted</p>
                    </div>
                    <div className="text-right pb-1">
                        <p className="text-zinc-600 text-[10px] mb-1">Month-end projection</p>
                        <p className="font-bold text-2xl" style={{ color: isUnder ? '#10b981' : '#ef4444' }}>
                            ₹{budget.projectedSpend.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: isUnder ? '#059669' : '#dc2626' }}>
                            {isUnder ? '✓ on track' : '⚠ over projected'}
                        </p>
                        {velocityText && <p className="text-zinc-700 text-[11px] mt-0.5">{velocityText}</p>}
                    </div>
                </div>

                <ProgressBar spent={budget.totalSpent} limit={budget.totalAllocated} height={8} />
                <div className="flex justify-between mt-2 mb-4">
                    <p className="text-zinc-600 text-[10px]">{totalPct}% of budget used</p>
                    <p className="text-zinc-600 text-[10px]">
                        ₹{Math.max(0, budget.totalAllocated - budget.totalSpent).toLocaleString('en-IN')} remaining
                    </p>
                </div>

                {/* ── Income: expected vs actual ── */}
                {incomeExpected > 0 && (
                    <div className="rounded-2xl p-3 mt-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-500 text-[10px] tracking-widest uppercase mb-2">Income this month</p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-zinc-500 text-[10px]">Expected</p>
                                <p className="text-white text-sm font-semibold">₹{incomeExpected.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-[10px]">Received so far</p>
                                <p className="text-emerald-400 text-sm font-semibold">₹{incomeActual.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-[10px]">Remaining</p>
                                <p className={`text-sm font-semibold ${incomeActual >= incomeExpected ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {incomeActual >= incomeExpected
                                        ? `+₹${(incomeActual - incomeExpected).toLocaleString('en-IN')}`
                                        : `₹${(incomeExpected - incomeActual).toLocaleString('en-IN')} due`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category rows */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Categories</p>
                    <p className="text-zinc-700 text-[9px]">swipe left to remove</p>
                </div>
                <div className="flex flex-col">
                    <AnimatePresence>
                        {localAllocations.map((alloc) => (
                            <motion.div key={alloc.category}
                                initial={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
                                <SwipeableCategoryRow
                                    alloc={alloc}
                                    spent={budget.spent?.[alloc.category] || 0}
                                    onDelete={() => handleRemoveCategory(alloc.category)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {(() => {
                        const untracked = Object.entries(budget.spent || {})
                            .filter(([cat]) => !localAllocations.find(a => a.category === cat))
                        if (!untracked.length) return null
                        const total = untracked.reduce((s, [, v]) => s + v, 0)
                        return (
                            <div className="px-4 py-4 border-t border-white/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                        <p className="text-zinc-500 text-sm">Other (no limit)</p>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-semibold">₹{total.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )
                    })()}
                    {localAllocations.length === 0 && (
                        <p className="text-zinc-700 text-xs text-center py-6">No categories allocated yet</p>
                    )}
                </div>
            </div>

            {/* Savings reveal */}
            <div className="rounded-2xl p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Savings estimate</p>
                    <button onClick={() => setShowSavings(p => !p)} className="text-zinc-600 p-1">
                        {showSavings ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                </div>
                {!isLastWeek && !showSavings ? (
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-zinc-600 text-xs leading-relaxed">Revealed in the<br />last 7 days of the month</p>
                        <button onClick={() => setShowSavings(true)}
                            className="text-xs text-zinc-500 px-3 py-1.5 rounded-xl active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            Reveal anyway
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        {(showSavings || isLastWeek) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-3">
                                    <p className="text-emerald-400 font-bold" style={{ fontSize: '2rem' }}>
                                        ₹{Math.max(0, budget.totalAllocated - budget.totalSpent).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-zinc-600 text-xs mt-1">saved vs your budget allocation</p>
                                    {budget.incomeExpected > 0 && (
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            ~₹{Math.max(0, budget.incomeExpected - budget.totalSpent).toLocaleString('en-IN')} vs expected income
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            <button onClick={onCreateNew}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm text-zinc-500 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Plus size={13} /> Create budget for a different month
            </button>
        </div>
    )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
const features = [
    { icon: BarChart2,    label: 'Monthly overview',   sub: 'See totals at a glance'      },
    { icon: PieChart,     label: 'Category limits',    sub: 'Allocate per category'       },
    { icon: TrendingDown, label: 'Spend tracking',     sub: 'Live progress as you spend'  },
    { icon: RotateCcw,    label: 'Roll over',          sub: 'Carry budgets forward'       },
    { icon: ShieldCheck,  label: 'Budget alerts',      sub: 'Know before it\'s too late'  },
    { icon: Zap,          label: 'AI insights',        sub: 'Monthly report by Artha AI'  },
]

function BudgetEmptyState({ onCreateClick }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-4 pb-4 px-1">
            <div className="grid grid-cols-3 gap-2 w-full mb-5">
                {features.slice(0, 3).map(({ icon: Icon, label, sub }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex flex-col items-center text-center gap-1.5 px-2 py-3.5 rounded-2xl"
                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <Icon size={16} className="text-indigo-400" strokeWidth={1.8} />
                        </div>
                        <p className="text-white text-[11px] font-semibold leading-tight">{label}</p>
                        <p className="text-zinc-500 text-[9px] leading-tight">{sub}</p>
                    </motion.div>
                ))}
            </div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 22, stiffness: 200 }}
                className="flex flex-col items-center text-center px-4 mb-5">
                <div className="relative flex items-center justify-center mb-5">
                    <div className="absolute w-32 h-32 rounded-full blur-2xl"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
                    <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.12))',
                            border: '1px solid rgba(99,102,241,0.35)',
                            boxShadow: '0 0 48px rgba(99,102,241,0.25)'
                        }}>
                        <Wallet size={36} className="text-indigo-300" strokeWidth={1.4} />
                    </div>
                </div>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-bold leading-tight mb-2">
                    <span className="text-[1.75rem]">Plan your month<br /></span>
                    <span className="text-indigo-400 text-[1.75rem]">before it plans you.</span>
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-[220px] mt-1">
                    Set a budget, allocate by category, and let Artha track it all for you.
                </p>
            </motion.div>
            <div className="grid grid-cols-3 gap-2 w-full mb-7">
                {features.slice(3).map(({ icon: Icon, label, sub }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06 }}
                        className="flex flex-col items-center text-center gap-1.5 px-2 py-3.5 rounded-2xl"
                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <Icon size={16} className="text-indigo-400" strokeWidth={1.8} />
                        </div>
                        <p className="text-white text-[11px] font-semibold leading-tight">{label}</p>
                        <p className="text-zinc-500 text-[9px] leading-tight">{sub}</p>
                    </motion.div>
                ))}
            </div>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                onClick={onCreateClick}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-semibold text-white active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
                <Plus size={16} strokeWidth={2.5} />
                Create Your First Budget
            </motion.button>
        </motion.div>
    )
}

// ─── Month-end card ───────────────────────────────────────────────────────────
function MonthEndCard({ budget, onRoll, onViewReport }) {
    const [rolling, setRolling] = useState(false)
    const nextMonth = MONTH_NAMES[(budget.month + 1) % 12]
    const handleRoll = async () => {
        setRolling(true)
        try { await api.post(`/budget/${budget._id}/roll`); onRoll() }
        catch (err) { console.error(err) }
        finally { setRolling(false) }
    }
    return (
        <div className="rounded-3xl p-5" style={{
            background: '#111111', border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 48px rgba(16,185,129,0.06)'
        }}>
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Month Complete</p>
            </div>
            <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-2xl font-bold mb-1">
                {MONTH_NAMES[budget.month]} wrapped up
            </p>
            <p className="text-zinc-500 text-xs mb-5">Your budget period has ended. See how you did.</p>
            <div className="flex gap-3">
                <button
                    onClick={onViewReport}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    View Report
                </button>
                <button onClick={handleRoll} disabled={rolling}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', opacity: rolling ? 0.7 : 1 }}>
                    {rolling ? 'Rolling...' : `Roll to ${nextMonth} →`}
                </button>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function Budget() {
    const { activeBudget, refreshBudget, stats } = useData()
    const [showCreate, setShowCreate] = useState(false)
    const [editingBudget, setEditingBudget] = useState(null)
    const [categories, setCategories] = useState([])
    const [allBudgets, setAllBudgets] = useState([])
    const [showAdd, setShowAdd] = useState(false)
    const [toast, setToast] = useState('')
    const [scrolled, setScrolled] = useState(false)
    const [selectedPastBudget, setSelectedPastBudget] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
        const h = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', h)
        return () => window.removeEventListener('scroll', h)
    }, [])

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(() => {})
        api.get('/budget/all').then(res => setAllBudgets(res.data)).catch(() => {})
    }, [activeBudget])

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const handleCreated = async () => {
        setShowCreate(false); setEditingBudget(null)
        await refreshBudget()
        showToast(editingBudget ? 'Budget updated ✓' : 'Budget activated 🎉')
    }

    const now = new Date()
    const budgetMonthPassed = activeBudget &&
        (activeBudget.year < now.getFullYear() ||
        (activeBudget.year === now.getFullYear() && activeBudget.month < now.getMonth()))

    const previousBudget = allBudgets.find(b => b.status === 'completed')
    const pastBudgets = allBudgets.filter(b => b.status === 'completed')

    return (
        <div className="min-h-screen bg-black text-white pb-40 px-4">
            <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

            <div className={`sticky top-0 z-50 flex justify-between items-center pr-2 py-3 px-1 transition-all duration-300 ${
                scrolled ? 'backdrop-blur-md bg-black/80 border-b border-white/5' : 'bg-transparent border-b border-transparent'
            }`}>
                <div>
                    <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-semibold text-2xl">Budget</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Plan your month</p>
                </div>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-bold text-4xl tracking-tight">Artha</p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                {!activeBudget && <BudgetEmptyState onCreateClick={() => setShowCreate(true)} />}

                {activeBudget && budgetMonthPassed && (
                    <MonthEndCard
                        budget={activeBudget}
                        onRoll={async () => { await refreshBudget(); showToast('Rolled to next month ✓') }}
                        onViewReport={() => setSelectedPastBudget(activeBudget)}
                    />
                )}

                {activeBudget && !budgetMonthPassed && (
                    <ActiveDashboard
                        budget={activeBudget}
                        stats={stats}
                        onEdit={() => { setEditingBudget(activeBudget); setShowCreate(true) }}
                        onCreateNew={() => { setEditingBudget(null); setShowCreate(true) }}
                    />
                )}

                {pastBudgets.length > 0 && (
                    <div className="mt-2">
                        <p className="text-zinc-600 text-xs tracking-widest uppercase px-1 mb-3">Past Budgets</p>
                        <div className="flex flex-col gap-2">
                            {pastBudgets.map(b => (
                                <button key={b._id}
                                    onClick={() => setSelectedPastBudget(b)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-all"
                                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="text-left">
                                        <p className="text-white text-sm font-semibold">{b.name}</p>
                                        <p className="text-zinc-600 text-xs mt-0.5">{MONTH_NAMES[b.month]} {b.year} · Completed</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-zinc-500 text-xs">₹{(b.incomeExpected || 0).toLocaleString('en-IN')}</p>
                                        <ChevronRight size={14} className="text-zinc-700" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rounded-2xl p-4 mt-1 flex items-center gap-3"
                    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>
                        <Zap size={15} className="text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm font-medium">Manage Subscriptions</p>
                        <p className="text-zinc-600 text-xs">Track recurring charges — coming soon</p>
                    </div>
                </div>
            </div>

            {/* Past budget detail modal */}
            <AnimatePresence>
                {selectedPastBudget && (
                    <PastBudgetModal
                        budget={selectedPastBudget}
                        onClose={() => setSelectedPastBudget(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCreate && (
                    <CreateBudgetModal
                        onClose={() => { setShowCreate(false); setEditingBudget(null) }}
                        onCreated={handleCreated}
                        existingCategories={categories}
                        previousBudget={previousBudget}
                        editingBudget={editingBudget}
                    />
                )}
            </AnimatePresence>

            <BottomNav onAddClick={() => setShowAdd(true)} />
            <AddTransaction
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                onSuccess={refreshBudget}
                onBudgetExceeded={(cat, overBy) => {
                    showToast(`⚠ ${cat} budget exceeded by ₹${overBy.toLocaleString('en-IN')}`)
                }}
            />
        </div>
    )
}

export default Budget