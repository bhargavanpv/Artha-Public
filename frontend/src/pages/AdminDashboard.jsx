import { useState, useEffect, useRef } from 'react'
import { Bar } from 'recharts'
import {
    BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Users, Receipt, MessageSquare, TrendingUp, RefreshCw, LogOut } from 'lucide-react'

const API = 'https://artha-dbci.onrender.com/api'
const PLAN_COLOR = { free: '#52525b', plus: '#6366f1', pro: '#10b981', power: '#f59e0b' }

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
    const [val, setVal] = useState('')
    const [err, setErr] = useState('')

    const tryLogin = async () => {
        if (!val.trim()) return setErr('Enter your secret')
        const res = await fetch(`${API}/admin/overview`, {
            headers: { 'x-admin-secret': val }
        })
        if (res.status === 401) return setErr('Wrong secret')
        onAuth(val)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-[340px] rounded-2xl p-8 text-center"
                style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontFamily: 'EB Garamond, serif' }}
                    className="text-white text-5xl font-bold mb-1">Artha</p>
                <p className="text-zinc-600 text-xs tracking-widest uppercase mb-7">Command Centre</p>
                <input
                    type="password"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && tryLogin()}
                    placeholder="Admin secret"
                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-4 py-3 outline-none mb-3 placeholder:text-zinc-700"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    autoFocus
                />
                <button
                    onClick={tryLogin}
                    className="w-full bg-white text-black font-semibold text-sm py-3 rounded-xl transition-opacity hover:opacity-90 active:opacity-75"
                >
                    Enter
                </button>
                {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
            </div>
        </div>
    )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = '#6366f1' }) {
    return (
        <div className="rounded-2xl p-5" style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-zinc-300 text-[10px] tracking-widest uppercase">{label}</p>
                <Icon size={14} style={{ color: accent }} />
            </div>
            <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-4xl font-bold leading-none mb-1">
                {value}
            </p>
            {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
        </div>
    )
}

// ── Plan bar ──────────────────────────────────────────────────────────────────
function PlanBar({ plan, count, total }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    const color = PLAN_COLOR[plan]
    return (
        <div className="flex items-center gap-3">
            <div className="w-16 flex-shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs capitalize" style={{ color }}>{plan}</span>
            </div>
            <div className="flex-1 h-1 rounded-full bg-zinc-900 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-white text-xs font-semibold w-5 text-right flex-shrink-0">{count}</span>
        </div>
    )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
function Dashboard({ secret, onLogout }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [view, setView] = useState('table')
    const [lastUpdated, setLastUpdated] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`${API}/admin/overview`, {
                headers: { 'x-admin-secret': secret }
            })
            if (!res.ok) throw new Error(`${res.status}`)
            const json = await res.json()
            setData(json)
            setLastUpdated(new Date().toLocaleTimeString('en-IN'))
        } catch (e) {
            setError('Failed to load — ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-zinc-600 text-sm">Fetching from Render...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
        </div>
    )

    const { totalUsers, totalTransactions, totalFeedback, planCounts, signupTimeline, users, recentFeedback } = data
    const paying = (planCounts.plus || 0) + (planCounts.pro || 0) + (planCounts.power || 0)
    const avgTxns = totalUsers > 0 ? Math.round(totalTransactions / totalUsers) : 0

    const chartData = (signupTimeline || []).slice(-21).map(s => ({
        day: new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: s.count,
    }))

    return (
        <div className="min-h-screen bg-black text-white pb-16">

            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
                style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold">
                    Artha <span className="text-zinc-600 text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>Command</span>
                </p>
                <div className="flex items-center gap-3">
                    {lastUpdated && <span className="text-zinc-700 text-[10px] hidden sm:block">Updated {lastUpdated}</span>}
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 text-zinc-500 text-xs px-3 py-2 rounded-xl transition-colors hover:text-white"
                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                        <RefreshCw size={11} /> Refresh
                    </button>
                    <button onClick={onLogout} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <LogOut size={14} />
                    </button>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
                </div>
            </div>

            <div className="px-4 sm:px-6 pt-6 max-w-5xl mx-auto">

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <StatCard label="Total Users" value={totalUsers} sub={`${paying} paying · ${planCounts.free || 0} free`} icon={Users} accent="#6366f1" />
                    <StatCard label="Transactions" value={totalTransactions.toLocaleString('en-IN')} sub="across all accounts" icon={Receipt} accent="#10b981" />
                    <StatCard label="Feedback" value={totalFeedback} sub="submissions" icon={MessageSquare} accent="#f59e0b" />
                    <StatCard label="Avg Txns/User" value={avgTxns} sub="per account" icon={TrendingUp} accent="#ef4444" />
                </div>

                {/* Chart + Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

                    {/* Signup chart */}
                    <div className="rounded-2xl p-4" style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-300 text-[10px] tracking-widest uppercase mb-4">Signups — last 21 days</p>
                        <ResponsiveContainer width="100%" height={175}>
                            <BarChart
                                data={chartData}
                                barCategoryGap="25%"
                                margin={{ left: -10, right: 0 }}
                            >
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: '#3f3f46', fontSize: 9 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={3}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}
                                    labelStyle={{ color: '#888', fontSize: 11 }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    formatter={v => [`${v} signup${v !== 1 ? 's' : ''}`, '']}
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {chartData.map((_, i) => (
                                        <Cell key={i} fill={_.count > 0 ? '#6366f1' : '#1f1f23'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Plan distribution */}
                    <div className="rounded-2xl p-5" style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-zinc-300 text-[10px] tracking-widest uppercase mb-5">Plan Distribution</p>
                        <div className="flex flex-col gap-4">
                            {['free', 'plus', 'pro', 'power'].map(p => (
                                <PlanBar key={p} plan={p} count={planCounts[p] || 0} total={totalUsers} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users panel */}
                <div className="rounded-2xl p-5 mb-4" style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-zinc-300 text-[10px] tracking-widest uppercase">
                            Users <span className="text-blue-600 border-1 rounded-2xl px-3 py-2 ml-2 normal-case tracking-normal text-xs">{totalUsers} total</span>
                        </p>
                        <div className="flex gap-1.5">
                            {['table', 'cards'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
                                    style={{
                                        background: view === v ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        color: view === v ? '#fff' : '#52525b',
                                        border: '1px solid ' + (view === v ? 'rgba(255,255,255,0.1)' : 'transparent')
                                    }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table view */}
                    {view === 'table' && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px]">
                                <thead>
                                    <tr>
                                        {['Name', 'Email', 'Plan', 'Txns', 'Joined', 'Last AI'].map(h => (
                                            <th key={h} className="text-left text-[10px] text-zinc-700 tracking-widest pb-3 pr-4 font-medium border-b border-white/5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => {
                                        const color = PLAN_COLOR[u.plan] || '#52525b'
                                        const joined = new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                                        const lastAI = u.lastMessageDate
                                            ? new Date(u.lastMessageDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                            : '—'
                                        return (
                                            <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 pr-4 text-white text-xs font-medium">{u.name}</td>
                                                <td className="py-2.5 pr-4 text-zinc-500 text-xs">{u.email}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                                                        style={{ background: color + '18', color }}>
                                                        {u.plan}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-white text-xs font-semibold">{u.transactionCount}</td>
                                                <td className="py-2.5 pr-4 text-zinc-600 text-xs">{joined}</td>
                                                <td className="py-2.5 text-zinc-600 text-xs">{lastAI}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Card view */}
                    {view === 'cards' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {users.map(u => {
                                const color = PLAN_COLOR[u.plan] || '#52525b'
                                const joined = new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                return (
                                    <div key={u._id} className="rounded-xl p-3.5"
                                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 flex-shrink-0"
                                            style={{ background: color + '20', border: `1px solid ${color}30` }}>
                                            <span style={{ fontFamily: 'EB Garamond, serif', color, fontSize: 18, fontWeight: 700 }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white text-xs font-semibold mb-0.5 truncate">{u.name}</p>
                                        <p className="text-zinc-600 text-[10px] truncate mb-2">{u.email}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                                                style={{ background: color + '18', color }}>{u.plan}</span>
                                            <span className="text-zinc-600 text-[10px]"><span className="text-white font-semibold">{u.transactionCount}</span> txns</span>
                                        </div>
                                        <p className="text-zinc-800 text-[10px] mt-2">{joined}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Feedback panel */}
                <div className="rounded-2xl p-5" style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-zinc-300 text-[10px] tracking-widest uppercase mb-4">
                        Recent Feedback <span className="text-zinc-800 normal-case tracking-normal text-xs ml-2">{totalFeedback} total</span>
                    </p>
                    {recentFeedback?.length === 0 ? (
                        <p className="text-zinc-700 text-sm text-center py-8">No feedback yet</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {recentFeedback?.map((f, i) => {
                                const name = f.anonymous ? 'Anonymous' : f.name
                                const date = new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                return (
                                    <div key={i} className="rounded-xl p-4"
                                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-white text-xs font-semibold">{name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: f.consentToDisplay ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                                        color: f.consentToDisplay ? '#10b981' : '#ef4444'
                                                    }}>
                                                    {f.consentToDisplay ? 'Public ✓' : 'Private'}
                                                </span>
                                                <span className="text-zinc-700 text-[10px]">{date}</span>
                                            </div>
                                        </div>
                                        <p className="text-zinc-500 text-xs leading-relaxed">{f.mainFeedback}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [secret, setSecret] = useState(() => sessionStorage.getItem('artha_admin') || '')

    const handleAuth = (s) => {
        sessionStorage.setItem('artha_admin', s)
        setSecret(s)
    }

    const handleLogout = () => {
        sessionStorage.removeItem('artha_admin')
        setSecret('')
    }

    if (!secret) return <AuthGate onAuth={handleAuth} />
    return <Dashboard secret={secret} onLogout={handleLogout} />
}