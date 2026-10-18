import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil,Palette,  RefreshCw , Check, X, ChevronRight, Sparkles, PieChart, Target, FileText, TrendingUp, BrainCircuit, Download, Scale, Bell, ArrowUpRight } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import AddTransaction from '../components/AddTransaction'
import FeedbackModal from '../components/FeedbackModal'
import BugReportModal from '../components/BugReportModal'
import { useData } from '../context/DataContext'
import UpgradeButton from '../components/UpgradeButton'
import { useAppTour } from "../components/AppTour"
import Changelog from '../components/ChangeLog'
import ManageCategories from '../components/ManageCategories'

import { useStoryUnlock } from '../hooks/useStoryUnlock'
import { UnlockCountdown } from '../components/UnlockCountdown'
import { BookOpen, Lock } from 'lucide-react'



// ─── Plan config ─────────────────────────────────────────────────────────────
const PLANS = {
  free:  { label: 'Artha Free',  color: '#71717a', price: '₹0',   period: 'forever' },
  plus:  { label: 'Artha Plus',  color: '#6366f1', price: '₹49',  period: '/mo' },
  pro:   { label: 'Artha Pro',   color: '#10b981', price: '₹99',  period: '/mo' },
  power: { label: 'Artha Power', color: '#f59e0b', price: '₹199', period: '/mo' },
}

const PLAN_PERKS = {
  free: [
    { text: '2 AI messages per day',               highlight: false },
    { text: 'Manual transaction logging',          highlight: false },
    { text: 'Spending & category charts',          highlight: false },
    { text: 'Savings',               highlight: false },
    { text: 'Standard AI model',                   highlight: false },
  ],
  plus: [
    { text: '10 AI messages per day',              highlight: true  },
    { text: 'Everything in Free',                  highlight: true },
    { text: 'Richer, more detailed AI responses',  highlight: true  },
    { text: 'Manage Savings',  highlight: true  },
  ],
  pro: [
    { text: '25 AI messages per day',              highlight: true  },
    { text: 'Everything in Plus',                  highlight: true },
    { text: 'Manage Budget !',                      highlight: true  },
    { text: 'Advanced AI model (GPT-4o)',          highlight: true  },
    { text: 'Deep pattern & anomaly detection',    highlight: true  },
    { text: 'Stories',        highlight: true  },
    { text: 'Month-over-month comparisons',        highlight: true  },
    { text: 'Priority support',                    highlight: false },
    
  ],
  power: [
    { text: '50 AI messages per day',              highlight: true  },
    { text: 'Manage Savings',  highlight: true  },
    { text: 'Everything in Pro',                   highlight: true },
    { text: 'Strongest reasoning AI model',        highlight: true  },
    { text: 'Access to Upcoming Premium Charts  ',       highlight: true  },
    { text: 'Officially my Friend & Direct line to the developer :)', highlight: true  },
  ],
}

const PLAN_TAGLINES = {
  free:  'Get started. Track your money for free.',
  plus:  'More AI, more insight. Built for daily use.',
  pro:   'Your financial co-pilot. Best value.',
  power: "The Full Artha Experience - a helping hand in developing Artha",
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mt-7 mb-3 px-1">
      <span className="text-gray-500 text-[12px] font-semibold tracking-[0.15em] uppercase">{children}</span>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  )
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function RowItem({ label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${
        danger
          ? 'bg-red-500/5 border border-red-500/10'
          : 'bg-[#111111] border border-white/[0.05]'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="text-left">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        {sub && <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>}
      </div>
      {onClick && <ChevronRight size={14} className={danger ? 'text-red-900' : 'text-zinc-700'} />}
    </button>
  )
}

// ─── Subscription modal (centered, vertically scrollable) ─────────────────────
function SubscriptionModal({ currentPlan, onClose }) {
  const plans = ['free', 'plus', 'pro', 'power']

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="rounded-3xl pt-5 px-4 pb-6 w-full"
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.07)',
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between mb-2 px-1">
          <div>
            <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold leading-tight">
              Plans that grow<br />with you
            </p>
            <p className="text-zinc-600 text-xs mt-2">Artha is built by one person. Every upgrade keeps it alive.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-1"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={13} className="text-zinc-500" />
          </button>
        </div>

        {/* Plan cards — stacked vertically, scroll inside modal */}
        <div className="flex flex-col gap-3 mt-6">
          {plans.map(key => {
            const p = PLANS[key]
            const isCurrent = currentPlan === key
            const perks = PLAN_PERKS[key]

            return (
              <div
                key={key}
                className="rounded-2xl p-5"
                style={{
                  background: isCurrent ? `${p.color}0e` : '#141414',
                  border: isCurrent ? `1.5px solid ${p.color}45` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isCurrent ? `0 0 32px ${p.color}15` : 'none',
                }}
              >
                {/* Plan name + current badge */}
                <div className="flex items-start justify-between mb-1">
                  <p style={{ fontFamily: 'EB Garamond, serif', color: p.color }} className="text-2xl font-bold">
                    {p.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full mt-1"
                      style={{ background: `${p.color}20`, color: p.color }}>
                      Current plan
                    </span>
                  )}
                </div>

                <p className="text-zinc-500 text-xs mb-3">{PLAN_TAGLINES[key]}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-white text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="text-zinc-600 text-sm">{p.period}</span>
                </div>

                {/* CTA button */}
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-sm font-medium text-center mb-5"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#52525b', border: '1px solid rgba(255,255,255,0.06)' }}>
                    Your current plan
                  </div>
                ) : key === 'free' ? (
                  <div className="w-full py-3 rounded-xl text-sm text-center mb-5"
                    style={{ background: 'rgba(255,255,255,0.02)', color: '#3f3f46' }}>
                    —
                  </div>
                ) : (
                  <UpgradeButton
                    plan={key}
                    onSuccess={(upgradedPlan) => {
                        onClose()
                        window.location.reload() // refreshes user context with new plan
                    }}
                />
                )}

                {/* Perks list */}
                <div className="flex flex-col gap-2.5">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex-shrink-0 text-xs"
                        style={{ color: perk.highlight ? p.color : '#3f3f46' }}>✓</span>
                      <span className="text-sm leading-snug"
                        style={{ color: perk.highlight ? '#e4e4e7' : '#52525b' }}>
                        {perk.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-zinc-700 text-xs text-center mt-6 px-4 leading-relaxed">
          Payments via Razorpay 
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Delete warning modal ─────────────────────────────────────────────────────
function WarningModal({ type, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="rounded-3xl p-6 w-full max-w-sm"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h3 className="text-white font-semibold text-xl mb-2">
          {type === 'transactions' ? 'Delete all transactions?' : 'Delete your account?'}
        </h3>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          {type === 'transactions'
            ? 'Every transaction will be permanently deleted. This cannot be undone.'
            : 'Your account, all transactions, and custom categories will be permanently deleted. This cannot be undone.'}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm text-zinc-400 bg-zinc-800">Cancel</button>
          <button
            onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-2xl text-sm text-white font-medium"
            style={{ background: '#7f1d1d', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Profile page ────────────────────────────────────────────────────────
function Profile() {

    
    const { startTour } = useAppTour();
    const navigate = useNavigate()

    // ── UI state ──
    const [showAdd, setShowAdd] = useState(false)
    const [warning, setWarning] = useState(null)       // 'transactions' | 'account'
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [toast, setToast] = useState('')
    const [showFeedback, setShowFeedback] = useState(false)
    const [showBugReport, setShowBugReport] = useState(false)
    const [showSubscription, setShowSubscription] = useState(false)
    const [dangerOpen, setDangerOpen] = useState(false)

    // ── Edit profile state ──
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editPassword, setEditPassword] = useState('')
    const [editConfirm, setEditConfirm] = useState('')
    const [editSaving, setEditSaving] = useState(false)

    // ── Balance mode state ──
    const [balanceMode, setBalanceMode] = useState('auto')  // 'auto' | 'manual'
    const [manualBalance, setManualBalance] = useState('')
    const [showBalanceEdit, setShowBalanceEdit] = useState(false)
    const [balanceInput, setBalanceInput] = useState('')
    const [balanceEditMode, setBalanceEditMode] = useState('set') // 'set' | 'add'

    //categories
    const [showCategories, setShowCategories] = useState(false)

    // ── Update Logs ──
    const [showChangelog, setShowChangelog] = useState(false)

    // ── Data from context (no fetch here — already loaded globally) ──
    const { user, refreshUser, stats, refreshData } = useData()

    // Fetching version
    const [version, setVersion] = useState('')
    const [tag, setTag] = useState('')
    const [date, setDate] = useState('')

    // For Story Mode
    const { transactions } = useData() // add transactions to your useData() destructure
    const unlock = useStoryUnlock(user, transactions)
    const [showStoryModal, setShowStoryModal] = useState(false)

    // Sync local edit fields whenever user data arrives from context
    useEffect(() => {
    if (user) {
        setEditName(user.name || '')
        setBalanceMode(user.balanceMode || 'auto')
        setManualBalance(user.manualBalance || '')
    }
    }, [user])

    // Check if just unlocked — show modal once per session
    useEffect(() => {
        if (unlock.fullyUnlocked && !localStorage.getItem('artha-story-seen')) {
            setShowStoryModal(true)
            localStorage.setItem('artha-story-seen', '1')
        }
    }, [unlock.fullyUnlocked])

    useEffect(() => {
    fetch('/version.json')
        .then(res => res.json())
        .then(data => {
            setVersion(data.version)
            setTag(data.tag)
            setDate(data.date)
        })
        .catch(() => {})
}, [])

    // ── Helpers ──
    const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
    }

    const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('artha-ai-messages')
    navigate('/login')
    }

    // ── Save name / password ──
    const handleSaveProfile = async () => {
    if (!editName.trim()) return showToast('Name cannot be empty')
    if (editPassword && editPassword !== editConfirm) return showToast('Passwords do not match')
    if (editPassword && editPassword.length < 6) return showToast('Password must be at least 6 characters')

    setEditSaving(true)
    try {
        const payload = { name: editName.trim() }
        if (editPassword) payload.password = editPassword

        await api.put('/auth/profile', payload)
        localStorage.setItem('name', editName.trim())
        await refreshUser()   // update context so header name refreshes too

        setEditing(false)
        setEditPassword('')
        setEditConfirm('')
        showToast('Profile updated')
    } catch (err) {
        showToast(err.response?.data?.message || 'Something went wrong')
    } finally {
        setEditSaving(false)
    }
    }

    // ── Save balance mode / manual amount ──
    const handleSaveBalance = async () => {
        if (balanceInput === '') return

        // The actual displayed balance right now
        const displayedBalance = user?.hasSetBalance
            ? (user?.manualBalance || 0) + (stats?.netCashFlowFromDate || 0)
            : (stats?.netCashFlow || 0)

        const newBalance = balanceEditMode === 'add'
            ? displayedBalance + Number(balanceInput)
            : Number(balanceInput)

        try {
            await api.put('/auth/profile', {
                manualBalance: newBalance,
                balanceSetDate: new Date(),  // always reset the date so netCashFlowFromDate starts fresh from 0
                hasSetBalance: true,
            })
            await refreshUser()
            await refreshUser()
            setShowBalanceEdit(false)
            setBalanceInput('')
            showToast('Balance updated')
        } catch (err) {
            showToast('Failed to save balance')
        }
    }
    // ── Delete all transactions ──
    const handleDeleteTransactions = async () => {
    setDeleteLoading(true)
    try {
        await api.delete('/transactions/delete-all')
        setWarning(null)
        showToast('All transactions deleted.')
    } catch (err) {
        console.error(err)
    } finally {
        setDeleteLoading(false)
    }
    }

    // ── Delete account ──
    const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
        await api.delete('/auth/account')
        localStorage.removeItem('token')
        localStorage.removeItem('name')
        navigate('/login')
    } catch (err) {
        console.error(err)
        setDeleteLoading(false)
    }
    }

    // ── Derived plan values ──
    const plan = PLANS[user?.plan] || PLANS.free
    const messagesUsed = user?.dailyMessageCount || 0
    const dailyLimit = { free: 2, plus: 10, pro: 25, power: 50 }[user?.plan] || 3

    // ─────────────────────────────────────────────────────────────────────────────
    return (
    <div className="min-h-screen bg-black text-white pb-32 px-4 pt-6">

        {/* ── Toast notification ── */}
        <AnimatePresence>
        {toast && (
            <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl text-sm text-white whitespace-nowrap"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
            >
            {toast}
            </motion.div>
        )}
        </AnimatePresence>

        {/* ── Page header ── */}
        <div className="flex justify-between items-center mb-7">
            <div className='flex items-end gap-1'>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white font-bold text-5xl">Artha</p>
                <button onClick={() => setShowChangelog(true)} className="text-zinc-500 flex justify-center items-center pl-1 text-xs">
                    {version} <ArrowUpRight size={12}/>
                </button>
            </div>

            <div className='flex gap-2'>
                <button
                    onClick={refreshData}
                    className="text-white rounded-full px-3 flex justify-center items-center bg-zinc-900 active:text-white active:scale-80 transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
                
                
                <button
                    onClick={handleLogout}
                    className="text-xs text-zinc-500 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    Log out
                </button> 
            </div>

        </div>

        {/* ══════════════════════════════ ACCOUNT ══════════════════════════════ */}
        <SectionLabel>Account</SectionLabel>

        {/* Hero card — avatar, name, email, plan badge, inline edit */}
        <div data-tour="account-card" className="rounded-3xl p-5 mb-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between mb-4">

            {/* Left: avatar + info */}
            <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${plan.color}40, ${plan.color}20)`, border: `1px solid ${plan.color}30` }}>
                <span className="text-white text-xl font-bold" style={{ fontFamily: 'EB Garamond, serif' }}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
            </div>
            <div>
                <p className="text-white text-lg font-semibold leading-tight">{user?.name || '...'}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{user?.email || '...'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plan.color }} />
                <span className="text-[11px] font-semibold" style={{ color: plan.color }}>{plan.label}</span>
                </div>
            </div>
            </div>

            {/* Right: edit / confirm / cancel buttons */}
            {!editing ? (
            <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <Pencil size={13} className="text-zinc-400" />
            </button>
            ) : (
            <div className="flex gap-2">
                <button
                onClick={() => { setEditing(false); setEditName(user?.name || ''); setEditPassword(''); setEditConfirm('') }}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                <X size={13} className="text-zinc-500" />
                </button>
                <button
                onClick={handleSaveProfile} disabled={editSaving}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
                >
                <Check size={13} className="text-indigo-400" />
                </button>
            </div>
            )}
        </div>

        {/* Inline edit fields — slide open when pencil is tapped */}
        <AnimatePresence>
            {editing && (
            <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                className="overflow-hidden"
            >
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">Name</label>
                    <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">
                    New password <span className="text-zinc-700">(leave blank to keep current)</span>
                    </label>
                    <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="••••••••"
                    />
                </div>
                {editPassword && (
                    <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">Confirm password</label>
                    <input
                        type="password"
                        value={editConfirm}
                        onChange={e => setEditConfirm(e.target.value)}
                        className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/50"
                        placeholder="••••••••"
                    />
                    </div>
                )}
                <button
                    onClick={handleSaveProfile} disabled={editSaving}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                    {editSaving ? 'Saving...' : 'Save changes'}
                </button>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
        </div>

        {/* 2-col row: balance mode button + notifications toggle */}
        {/* Balance + Notifications row */}
            <div className="grid grid-cols-2 gap-2 mb-1">

                {/* Adjust Balance */}
                <button
                    onClick={() => setShowBalanceEdit(p => !p)}
                    className="flex items-center gap-2 px-3 py-3 rounded-2xl transition-all active:scale-95"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <Scale size={13} className="text-indigo-400 flex-shrink-0" />
                    <div className="text-left min-w-0">
                        <p className="text-white text-xs font-medium">Balance</p>
                        <p className="text-indigo-400 text-[10px]">
                            {user?.hasSetBalance ? `₹${(user?.manualBalance || 0).toLocaleString('en-IN')}` : 'Not set'}
                        </p>
                    </div>
                </button>

                {/* Notifications — coming soon */}
                <div
                    className="flex items-center justify-between px-3 py-3 rounded-2xl"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-2">
                        <Bell size={13} className="text-zinc-600 flex-shrink-0" />
                        <div>
                            <p className="text-zinc-500 text-xs font-medium">Alerts</p>
                            <p className="text-zinc-700 text-[10px]">Coming soon</p>
                        </div>
                    </div>
                    <div className="w-8 h-4 rounded-full bg-zinc-800 flex items-center px-0.5">
                        <div className="w-3 h-3 rounded-full bg-zinc-600" />
                    </div>
                </div>
            </div>

            {/* Balance edit — slides in */}
            <AnimatePresence>
            {showBalanceEdit && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-1"
                >
                    <div className="rounded-2xl overflow-hidden mb-1"
                        style={{ background: '#111111', border: '1px solid rgba(99,102,241,0.2)' }}>
                        
                        {/* Mode toggle */}
                        <div className="flex border-b border-white/5">
                            <button
                                onClick={() => setBalanceEditMode('set')}
                                className="flex-1 py-2.5 text-xs font-medium transition-all"
                                style={{
                                    background: balanceEditMode === 'set' ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: balanceEditMode === 'set' ? '#a5b4fc' : '#52525b'
                                }}
                            >
                                Set exact balance
                            </button>
                            <button
                                onClick={() => setBalanceEditMode('add')}
                                className="flex-1 py-2.5 text-xs font-medium transition-all"
                                style={{
                                    background: balanceEditMode === 'add' ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: balanceEditMode === 'add' ? '#a5b4fc' : '#52525b'
                                }}
                            >
                                Add to current
                            </button>
                        </div>

                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="text-zinc-500 text-sm">₹</span>
                            <input
                                type="number"
                                value={balanceInput}
                                onChange={e => setBalanceInput(e.target.value)}
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-700"
                                placeholder={balanceEditMode === 'set' ? 'Enter your actual balance' : 'Amount to add'}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveBalance}
                                className="text-xs h-[30px] px-4 rounded-xl bg-indigo-500 text-white font-semibold"
                            >
                                Save
                            </button>
                        </div>

                        {/* Context line */}
                        <p className="text-zinc-600 text-[10px] px-4 pb-3">
                            {(() => {
                                const displayed = user?.hasSetBalance
                                    ? (user?.manualBalance || 0) + (stats?.netCashFlowFromDate || 0)
                                    : (stats?.netCashFlow || 0)
                                return balanceEditMode === 'set'
                                    ? `Current: ₹${displayed.toLocaleString('en-IN')} → will be replaced`
                                    : `Current: ₹${displayed.toLocaleString('en-IN')} + ₹${balanceInput || '0'} = ₹${(displayed + (Number(balanceInput) || 0)).toLocaleString('en-IN')}`
                            })()}
                        </p>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

        {/* Manual balance input — slides in only when manual mode is active */}
        <AnimatePresence>
        {balanceMode === 'manual' && (
            <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden mb-1"
            >
            <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: '#111111', border: '1px solid rgba(99,102,241,0.2)' }}
            >
                <span className="text-zinc-500 text-sm">₹</span>
                <input
                type="number"
                value={manualBalance}
                onChange={e => setManualBalance(e.target.value)}
                onBlur={() => handleSaveBalance('manual')}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-700"
                placeholder="Enter your current balance"
                />
                <button
                onClick={() => handleSaveBalance('manual')}
                className="text-xs h-[30px] w-[50px] rounded-2xl bg-gray-500 text-black font-bold"
                >
                Save
                </button>
            </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* ══════════════════════════════ AI ═══════════════════════════════════ */}
        <SectionLabel>AI</SectionLabel>

        {/* Monthly message usage with animated progress bar */}
        <div data-tour="ai-usage" className="rounded-2xl p-4 mb-1" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between items-center mb-3">
            <p className="text-white text-sm font-medium">Usage Today</p>
            <span className="text-zinc-600 text-xs">{dailyLimit - messagesUsed} left</span>
        </div>
        <div className="flex justify-between items-center mb-2">
            <p className="text-zinc-500 text-xs">{messagesUsed} / {dailyLimit} messages</p>
            <p className="text-xs font-medium" style={{ color: plan.color }}>{plan.label} model</p>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-900">
            <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((messagesUsed / dailyLimit) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-1.5 rounded-full"
            style={{
                background: messagesUsed >= dailyLimit
                ? '#ef4444'
                : `linear-gradient(90deg, ${plan.color}, ${plan.color}cc)`,
                boxShadow: messagesUsed >= dailyLimit ? '0 0 6px #ef4444' : `0 0 6px ${plan.color}60`,
            }}
            />
        </div>
        {messagesUsed >= dailyLimit && (
            <p className="text-red-400 text-xs mt-2">Daily limit reached. Upgrade to continue.</p>
        )}
        </div>

        {/* ══════════════════════════ MY STORY ════════════════════════════ */}
        <SectionLabel>My Story</SectionLabel>

        <div className="rounded-2xl overflow-hidden mb-1"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>

            {unlock.fullyUnlocked ? (
                // UNLOCKED STATE
                <button
                    onClick={() => navigate('/story')}
                    className="w-full flex items-center justify-between px-4 py-4 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'lightgreen', border: '1px solid green' }}>
                            <BookOpen size={19} className="text-black" />
                        </div>
                        <div className="text-left">
                            <p className="text-white text-sm font-semibold">My Financial Story</p>
                            <p className="text-zinc-500 text-xs mt-0.5">Records, heatmap & spending patterns</p>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-700" />
                </button>
            ) : (
                // LOCKED STATE — progress
                <div className="px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Lock size={14} className="text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold">My Financial Story</p>
                            <p className="text-zinc-500 text-xs mt-0.5">Unlocks when you've built enough history</p>
                        </div>
                    </div>

                    {/* Transaction progress */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                            <p className="text-zinc-500 text-xs">
                                {unlock.txUnlocked ? '✓ ' : ''}{unlock.txCount} / {unlock.REQUIRED_TXN} transactions
                            </p>
                            <p className="text-zinc-600 text-xs">
                                {unlock.txUnlocked ? 'Done' : `${unlock.REQUIRED_TXN - unlock.txCount} to go`}
                            </p>
                        </div>
                        {/* Non-neon plain progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${unlock.txProgress * 100}%`,
                                    background: unlock.txUnlocked ? '#10b981' : '#6366f1'
                                }}
                            />
                        </div>
                    </div>

                    {/* Days progress */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <p className="text-zinc-500 text-xs">
                                {unlock.daysUnlocked ? '✓ ' : ''}{unlock.daysSinceJoin} / {unlock.REQUIRED_DAYS} days with Artha
                            </p>
                            <p className="text-zinc-600 text-xs">
                            {unlock.daysUnlocked
                                ? 'Done'
                                : unlock.isLastDay && unlock.unlockDate
                                    ? <UnlockCountdown unlockDate={unlock.unlockDate} />
                                    : `${unlock.REQUIRED_DAYS - unlock.daysSinceJoin} days left`
                            }
                            </p>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${unlock.dayProgress * 100}%`,
                                    background: unlock.daysUnlocked ? '#10b981' : '#6366f1'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
        {/* ══════════════════════════ SUBSCRIPTION ═════════════════════════════ */}
        <SectionLabel>Subscription</SectionLabel>

        <div data-tour="subscription" className="rounded-2xl p-4 mb-1" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
            <div>
            <p className="text-white text-sm font-medium">{plan.label}</p>
            <p className="text-zinc-600 text-xs mt-0.5">
                {user?.plan === 'free' ? 'Free forever' : `${PLANS[user?.plan]?.price}/mo · renews automatically`}
            </p>
            </div>
            <button
            onClick={() => setShowSubscription(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30`, color: plan.color }}
            >
            <Sparkles size={11} />
            {user?.plan === 'free' ? 'Upgrade' : 'Manage'}
            </button>
        </div>
        </div>

        {/* ════════════════════════════ COMING SOON ════════════════════════════ */}
        <SectionLabel>Coming Soon</SectionLabel>

        {/* Compact 2-col feature grid — no descriptions, no tier badges */}
        <div className="grid grid-cols-2 gap-2">
        {[
            // { label: 'Budgeting',     Icon: PieChart  },
            { label: 'Manage Subscriptions',     Icon: PieChart     },
            { label: 'Email Verification', Icon: Target       },
            // { label: 'Reports',       Icon: FileText     },
        //  { label: 'Predictions',   Icon: TrendingUp   },
            { label: 'UI Themes',   Icon: Palette },
            { label: 'CSV Export',    Icon: Download     },
        ].map(({ label, Icon }) => (
            <div
            key={label}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}
            >
            <Icon size={16} className="text-zinc-600 flex-shrink-0" />
            <span className="text-zinc-400 text-sm font-medium">{label}</span>
            </div>
        ))}
        </div>

        {/* ══════════════════════════════ SUPPORT ══════════════════════════════ */}
        <SectionLabel>Support</SectionLabel>

        <div className="flex flex-col gap-2">
            <RowItem label="Share Feedback"    sub="Tell us what you think"       onClick={() => setShowFeedback(true)} />
            <RowItem label="Report a Problem"  sub="Something broken? Let us know" onClick={() => setShowBugReport(true)} /> 
            {/* <RowItem
                label="Manage Categories"
                sub="Add, edit or delete your categories"
                onClick={() => setShowCategories(true)}
            /> */}
            <div className='flex gap-2'>
                <RowItem 
                    label="Artha Tutorial" 
                    sub="Get a tour of Artha and its features" 
                    onClick={() => {
                        localStorage.removeItem('artha-tour-done')
                        setTimeout(() => startTour(), 300)
                    }} 
                />
            </div>
            
        </div>

        {/* ══════════════════════════════ DANGER ═══════════════════════════════ */}
        <SectionLabel>Danger</SectionLabel>

        {/* Collapsible danger zone — hidden by default to avoid accidents */}
        <button
        onClick={() => setDangerOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2 transition-all"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
        >
        <span className="text-red-500/70 text-sm font-medium">Delete & Reset</span>
        <motion.span animate={{ rotate: dangerOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={14} className="text-red-900" />
        </motion.span>
        </button>

        <AnimatePresence>
        {dangerOpen && (
            <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden ml-5 flex flex-col gap-2"
            >
            <RowItem label="Delete all transactions" danger onClick={() => setWarning('transactions')} />
            <RowItem label="Delete account" sub="Permanently removes everything" danger onClick={() => setWarning('account')} />
            </motion.div>
        )}
        </AnimatePresence>

        {/* ── Modals ── */}
        <AnimatePresence>
        {showSubscription && (
            <SubscriptionModal currentPlan={user?.plan || 'free'} onClose={() => setShowSubscription(false)} />
        )}
        {warning && (
            <WarningModal
            type={warning}
            loading={deleteLoading}
            onConfirm={warning === 'transactions' ? handleDeleteTransactions : handleDeleteAccount}
            onCancel={() => setWarning(null)}
            />
        )}
        </AnimatePresence>

        {/* manage categories */}
        {showCategories && (
            <ManageCategories
                isOpen={showCategories}
                onClose={() => setShowCategories(false)}
            />
        )}

        {showStoryModal && (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowStoryModal(false)}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full rounded-t-3xl px-5 pt-6 pb-12"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mb-6" />

                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.12))',
                            border: '1px solid rgba(99,102,241,0.35)',
                            boxShadow: '0 0 40px rgba(99,102,241,0.2)'
                        }}>
                        <BookOpen size={28} className="text-indigo-300" strokeWidth={1.4} />
                    </div>
                </div>

                <p style={{ fontFamily: 'EB Garamond, serif' }}
                    className="text-white text-3xl font-bold text-center mb-2">
                    Your story is ready
                </p>
                <p className="text-zinc-500 text-sm text-center leading-relaxed mb-6 px-4">
                    You've built enough history with Artha. See your spending heatmap, records, 
                    patterns, and what your data says about you.
                </p>

                <div className="flex flex-col gap-3 px-1">
                    <button
                        onClick={() => { setShowStoryModal(false); navigate('/story') }}
                        className="w-full py-4 rounded-2xl text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                        See My Story →
                    </button>
                    <button
                        onClick={() => setShowStoryModal(false)}
                        className="w-full py-3 rounded-2xl text-zinc-500 text-sm"
                    >
                        Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )}
        
        <BottomNav onAddClick={() => setShowAdd(true)} />
        <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => {}} />
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
        {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
    </div>
    )
}

export default Profile