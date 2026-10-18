import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import AddTransaction from '../components/AddTransaction'
import { ArrowLeft } from 'lucide-react'

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function SpendHeatmap({ heatmap }) {
    const weeks = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build 52 weeks × 7 days grid, ending today
    const end = new Date(today)
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    // align start to Sunday
    start.setDate(start.getDate() - start.getDay())

    let cursor = new Date(start)
    while (cursor <= end) {
        const week = []
        for (let d = 0; d < 7; d++) {
            const key = cursor.toISOString().split('T')[0]
            const amount = heatmap[key] || 0
            const isFuture = cursor > today
            week.push({ key, amount, isFuture, date: new Date(cursor) })
            cursor.setDate(cursor.getDate() + 1)
        }
        weeks.push(week)
    }

    // Color intensity
    const allAmounts = Object.values(heatmap).filter(v => v > 0)
    const maxAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : 1

    const getColor = (amount, isFuture) => {
        if (isFuture || amount === 0) return 'rgba(255,255,255,0.04)'
        const intensity = Math.min(amount / maxAmount, 1)
        if (intensity < 0.25) return 'rgba(99,102,241,0.2)'
        if (intensity < 0.5)  return 'rgba(99,102,241,0.45)'
        if (intensity < 0.75) return 'rgba(99,102,241,0.7)'
        return '#6366f1'
    }

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    // Month labels — find first week of each month
    const monthLabels = []
    weeks.forEach((week, wi) => {
        const firstDay = week[0]
        if (!firstDay.isFuture && firstDay.date.getDate() <= 7) {
            monthLabels.push({ wi, label: MONTHS[firstDay.date.getMonth()] })
        }
    })

    const CELL = 10
    const GAP = 2
    const totalW = weeks.length * (CELL + GAP)

    return (
        <div className="rounded-2xl p-4"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase mb-4">
                Spending Activity · Last 12 Months
            </p>

            <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                <div style={{ width: totalW, position: 'relative' }}>

                    {/* Month labels */}
                    <div style={{ display: 'flex', marginBottom: 4, height: 12 }}>
                        {weeks.map((week, wi) => {
                            const label = monthLabels.find(m => m.wi === wi)
                            return (
                                <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}>
                                    {label && (
                                        <span style={{
                                            fontSize: 8,
                                            color: '#52525b',
                                            whiteSpace: 'nowrap',
                                            position: 'absolute',
                                            left: wi * (CELL + GAP)
                                        }}>
                                            {label.label}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Grid */}
                    <div style={{ display: 'flex', gap: GAP }}>
                        {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                                {week.map((day) => (
                                    <div
                                        key={day.key}
                                        title={day.amount > 0 ? `${day.key}: ₹${day.amount.toLocaleString('en-IN')}` : day.key}
                                        style={{
                                            width: CELL,
                                            height: CELL,
                                            borderRadius: 2,
                                            backgroundColor: getColor(day.amount, day.isFuture),
                                            flexShrink: 0,
                                            transition: 'background-color 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Day labels */}
                    <div style={{
                        position: 'absolute',
                        right: -22,
                        top: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: GAP
                    }}>
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={i} style={{
                                height: CELL,
                                fontSize: 7,
                                color: '#3f3f46',
                                display: 'flex',
                                alignItems: 'center'
                            }}>{i % 2 === 1 ? d : ''}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3">
                <p className="text-zinc-700 text-[9px]">Less</p>
                {[0.1, 0.3, 0.55, 0.8, 1].map((v, i) => (
                    <div key={i} style={{
                        width: 10, height: 10, borderRadius: 2,
                        backgroundColor: v === 0.1 ? 'rgba(255,255,255,0.04)' : `rgba(99,102,241,${v})`
                    }} />
                ))}
                <p className="text-zinc-700 text-[9px]">More</p>
            </div>
        </div>
    )
}

// ─── Record Card ──────────────────────────────────────────────────────────────
function RecordCard({ label, value, sub, color = 'white', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35 }}
            className="rounded-2xl p-4"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <p className="text-zinc-400 text-[10px] tracking-widest uppercase mb-2">{label}</p>
            <p className="font-bold text-xl tracking-tight leading-tight mb-1" style={{ color }}>
                {value}
            </p>
            {sub && <p className="text-zinc-600 text-xs leading-snug">{sub}</p>}
        </motion.div>
    )
}

// ─── Personality Card ─────────────────────────────────────────────────────────
function PersonalityCard({ dowSpend }) {
    if (!dowSpend || dowSpend.every(v => v === 0)) return null

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const max = Math.max(...dowSpend)
    const busiestIdx = dowSpend.indexOf(max)
    const busiestDay = DAYS[busiestIdx]

    const weekdayTotal = dowSpend.slice(1, 6).reduce((s, v) => s + v, 0)
    const weekendTotal = dowSpend[0] + dowSpend[6]
    const isWeekendSpender = weekendTotal > weekdayTotal * 0.5

    const firstHalfWeek = dowSpend.slice(1, 4).reduce((s, v) => s + v, 0) // Mon-Wed
    const secondHalfWeek = dowSpend.slice(4, 7).reduce((s, v) => s + v, 0) // Thu-Sat+Sun
    const isFrontLoaded = firstHalfWeek > secondHalfWeek

    const getPersonality = () => {
        if (isWeekendSpender) return {
            title: 'The Weekend Spender',
            desc: `Your wallet takes the weekends off — from saving. ${busiestDay} is your biggest spending day . The week is just a countdown to it.`
        }
        if (busiestIdx >= 1 && busiestIdx <= 3) return {
            title: 'The Early Week Burner',
            desc: `${busiestDay} hits different for your wallet. You front-load your spending early in the week and coast toward the weekend.`
        }
        return {
            title: 'The Late Week Finisher',
            desc: `You save your spending for the second half of the week. ${busiestDay} is your peak . Maybe it's the "treat yourself Thursday" effect.`
        }
    }

    const personality = getPersonality()

    // Bar chart of dow
    const barMax = Math.max(...dowSpend, 1)

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-2xl p-4"
            style={{ background: '#111111', border: '1px solid rgba(99,102,241,0.15)' }}
        >
            <p className="text-zinc-500 text-[10px] tracking-widest uppercase mb-1">Spending Personality</p>
            <p style={{ fontFamily: 'EB Garamond, serif' }}
                className="text-white text-xl font-bold mb-2">{personality.title}</p>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">{personality.desc}</p>

            {/* DOW bar chart */}
            <div className="flex items-end gap-1.5 h-12">
                {dowSpend.map((amt, i) => {
                    const heightPct = barMax > 0 ? (amt / barMax) * 100 : 0
                    const isMax = i === busiestIdx
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-sm flex items-end" style={{ height: 36 }}>
                                <div
                                    className="w-full rounded-sm transition-all duration-700"
                                    style={{
                                        height: `${heightPct}%`,
                                        background: isMax ? '#6366f1' : 'rgba(255,255,255,0.08)',
                                        minHeight: amt > 0 ? 2 : 0
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: 7, color: isMax ? '#a5b4fc' : '#3f3f46' }}>
                                {['S','M','T','W','T','F','S'][i]}
                            </p>
                        </div>
                    )
                })}
            </div>
        </motion.div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Story() {
    const navigate = useNavigate()
    const { transactions, refreshData, user } = useData()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        const h = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', h)
        return () => window.removeEventListener('scroll', h)
    }, [])

    useEffect(() => {
        api.get('/transactions/story')
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false))
    }, [])

    const r = data?.records || {}
    const MONTHS = ['January','February','March','April','May','June',
        'July','August','September','October','November','December']

    const formatMonth = (key) => {
        if (!key) return ''
        const [y, m] = key.split('-')
        return `${MONTHS[parseInt(m) - 1]} ${y}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-black text-white pb-32 px-4">

            {/* Header */}
            <div className={`sticky top-0 z-50 flex items-center justify-between pr-2 py-3 px-1 transition-all duration-300 ${
                scrolled ? 'backdrop-blur-md bg-black/80 border-b border-white/5' : 'bg-transparent border-b border-transparent'
            }`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <ArrowLeft size={14} className="text-zinc-400" />
                    </button>
                    <div>
                        <p style={{ fontFamily: 'EB Garamond, serif' }}
                            className="text-white font-semibold text-2xl">My Story</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Your financial history</p>
                    </div>
                </div>
                <p style={{ fontFamily: 'EB Garamond, serif' }}
                    className="text-white font-bold text-4xl tracking-tight">Artha</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <p className="text-zinc-600 text-sm">Reading your story...</p>
                </div>
            ) : !data || data.empty ? (
                <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
                    <p style={{ fontFamily: 'EB Garamond, serif' }}
                        className="text-white text-2xl font-bold mb-2">Nothing yet</p>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Log some transactions and come back. Your story builds over time.
                    </p>
                </div>
            ) : (
                <div className="mt-4 flex flex-col gap-3">

                    {/* Intro line */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-1 mb-1"
                    >
                        <p style={{ fontFamily: 'EB Garamond, serif' }}
                            className="text-white text-3xl font-bold leading-tight">
                            {r.totalTransactions} decisions.<br />
                            <span className="text-zinc-500">All tracked.</span>
                        </p>
                    </motion.div>

                    {/* Heatmap */}
                    <SpendHeatmap heatmap={data.heatmap || {}} />

                    {/* Personality */}
                    <PersonalityCard dowSpend={data.dowSpend} />

                    {/* Record board — 2 col grid */}
                    <p className="text-zinc-600 text-xs tracking-widest uppercase px-1 mt-1">The Records</p>

                    <div className="grid grid-cols-2 gap-3">
                        {r.biggestExpense && (
                            <RecordCard
                                label="Biggest Expense"
                                value={`₹${r.biggestExpense.amount.toLocaleString('en-IN')}`}
                                sub={`${r.biggestExpense.description} · ${formatDate(r.biggestExpense.date)}`}
                                color="#ef4444"
                                delay={0}
                            />
                        )}
                        {r.biggestIncome && (
                            <RecordCard
                                label="Biggest Income"
                                value={`₹${r.biggestIncome.amount.toLocaleString('en-IN')}`}
                                sub={`${r.biggestIncome.description} · ${formatDate(r.biggestIncome.date)}`}
                                color="#10b981"
                                delay={0.05}
                            />
                        )}
                        {r.totalTransactions && (
                            <RecordCard
                                label="Total Logged"
                                value={r.totalTransactions.toLocaleString('en-IN')}
                                sub={`${r.totalDebits} expenses · ${r.totalCredits} income`}
                                delay={0.1}
                            />
                        )}
                        {r.avgMonthlySpend > 0 && (
                            <RecordCard
                                label="Avg Monthly Spend"
                                value={`₹${r.avgMonthlySpend.toLocaleString('en-IN')}`}
                                sub="across all months on record"
                                delay={0.15}
                            />
                        )}
                        {r.mostExpensiveMonth && (
                            <RecordCard
                                label="Biggest Month"
                                value={`₹${r.mostExpensiveMonth.amount.toLocaleString('en-IN')}`}
                                sub={formatMonth(r.mostExpensiveMonth.key)}
                                color="#f59e0b"
                                delay={0.2}
                            />
                        )}
                        {r.topCategory && (
                            <RecordCard
                                label="Can't Stop Won't Stop"
                                value={r.topCategory.name}
                                sub={`₹${r.topCategory.total.toLocaleString('en-IN')} total spend`}
                                color="#a5b4fc"
                                delay={0.25}
                            />
                        )}
                        {r.smallestExpense && (
                            <RecordCard
                                label="Smallest Expense"
                                value={`₹${r.smallestExpense.amount.toLocaleString('en-IN')}`}
                                sub={r.smallestExpense.description}
                                delay={0.3}
                            />
                        )}
                    </div>

                    {/* Footer note */}
                    <p className="text-zinc-700 text-[10px] text-center px-4 leading-relaxed mt-2 mb-4">
                        Your story updates every time you log a transaction.
                        The more you track, the more Artha knows.
                    </p>
                </div>
            )}

            <BottomNav onAddClick={() => setShowAdd(true)} />
            <AddTransaction
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                onSuccess={refreshData}
            />
        </div>
    )
}

export default Story