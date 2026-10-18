import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X,Clapperboard, Plus,SportShoe, Trash2, ArrowLeft, Plane, Home, Car, Smartphone, ShoppingBag, GraduationCap, Laptop, Watch, Wallet, Target, Umbrella, Gift, ChevronRight, PlusCircle } from 'lucide-react'
import api from '../api/axios'

const ICONS = [
    { key: 'target',    Icon: Target },
    { key: 'plane',     Icon: Plane },
    { key: 'movie',     Icon: Clapperboard},
    { key: 'home',      Icon: Home },
    { key: 'car',       Icon: Car },
    { key: 'phone',     Icon: Smartphone },
    { key: 'bag',       Icon: ShoppingBag },
    { key: 'grad',      Icon: GraduationCap },
    { key: 'laptop',    Icon: Laptop },
    { key: 'watch',     Icon: Watch },
    { key: 'wallet',    Icon: Wallet },
    { key: 'umbrella',  Icon: Umbrella },
    { key: 'gift',      Icon: Gift },
    { key: 'shoe',      Icon: SportShoe }
]

const COLORS = [
    '#6366f1', // indigo
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
]

function GoalIcon({ iconKey, color, size = 24 }) {
    const found = ICONS.find(i => i.key === iconKey)
    const Icon = found ? found.Icon : Target
    return <Icon size={size} color={color || '#6366f1'} strokeWidth={1.8} />
}

function CircleProgress({ percent, size = 52, stroke = 3.5, color = '#6366f1' }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (Math.min(percent, 100) / 100) * circ
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
                style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
                fill="white" fontSize={size < 50 ? 11 : 14} fontWeight="700">
                {Math.round(percent)}%
            </text>
        </svg>
    )
}

export default function ManageSavings({ isOpen, onClose, onUpdate }) {
    const [savings, setSavings] = useState([])
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState('list')
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [editTarget, setEditTarget] = useState(null)
    const [addMoneyTarget, setAddMoneyTarget] = useState(null)
    const [addAmount, setAddAmount] = useState('')
    const [addLoading, setAddLoading] = useState(false)

    const [form, setForm] = useState({
        name: '', targetAmount: '', savedAmount: '', iconKey: 'target', color: '#6366f1'
    })

    const fetchSavings = async () => {
        try {
            const res = await api.get('/savings')
            setSavings(res.data)
        } catch (err) { console.error(err) }
    }

    useEffect(() => { if (isOpen) { fetchSavings(); setView('list') } }, [isOpen])
    useEffect(() => {
        if (isOpen && savings.length === 0 && view === 'list') setView('form')
    }, [savings, isOpen])

    const resetForm = () => setForm({ name: '', targetAmount: '', savedAmount: '', iconKey: 'target', color: '#6366f1' })

    const handleCreate = async () => {
        if (!form.name.trim() || !form.targetAmount) return
        setLoading(true)
        try {
            await api.post('/savings', form)
            await fetchSavings()
            resetForm()
            setView('list')
            onUpdate?.()
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleUpdate = async () => {
        if (!editTarget) return
        setLoading(true)
        try {
            await api.patch(`/savings/${editTarget._id}`, form)
            await fetchSavings()
            setEditTarget(null)
            setView('list')
            onUpdate?.()
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/savings/${id}`)
            setSavings(prev => prev.filter(s => s._id !== id))
            setDeleteConfirm(null)
            onUpdate?.()
        } catch (err) { console.error(err) }
    }

    const handleAddMoney = async () => {
        if (!addAmount || !addMoneyTarget) return
        setAddLoading(true)
        try {
            const newSaved = addMoneyTarget.savedAmount + Number(addAmount)
            await api.patch(`/savings/${addMoneyTarget._id}`, { savedAmount: newSaved })
            await fetchSavings()
            setAddMoneyTarget(null)
            setAddAmount('')
            onUpdate?.()
        } catch (err) { console.error(err) }
        finally { setAddLoading(false) }
    }

    const openEdit = (saving) => {
        setForm({
            name: saving.name,
            targetAmount: saving.targetAmount,
            savedAmount: saving.savedAmount,
            iconKey: saving.iconKey || 'target',
            color: saving.color || '#6366f1'
        })
        setEditTarget(saving)
        setView('edit')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center"
                style={{ background: 'rgba(0,0,0,0.75)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full rounded-t-3xl px-5 pt-4 pb-12 max-h-[90vh] overflow-y-auto"
                    style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.07)', scrollbarWidth: 'none' }}
                >
                    
                    {/* Sticky Header */}
                    <div className='sticky z-50 top-0 bg-[#0e0e0e]'>
                        {/* Handle */}
                        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-5" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                {(view === 'form' || view === 'edit') && savings.length > 0 && (
                                    <button
                                        onClick={() => { setView('list'); resetForm(); setEditTarget(null) }}
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <ArrowLeft size={16} className="text-zinc-400" />
                                    </button>
                                )}
                                <p className="text-white font-semibold text-lg">
                                    {view === 'list' ? 'Savings Goals' : view === 'edit' ? 'Edit Goal' : 'New Goal'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {view === 'list' && (
                                    <button
                                        onClick={() => { resetForm(); setView('form') }}
                                        className=" flex justify-center items-center gap-1.5 text-[14px] font-semibold w-20 h-10 rounded-2xl active:scale-95 transition-all"
                                        style={{  border: '2px solid rgba(99,80,241,0.3)', color:'rgba(99,80,241,1)'}}
                                    >
                                        <Plus size={16} /> New
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 border-1 border-solid bg-[#1a1a1a] border-zinc-700 rounded-2xl flex items-center justify-center active:border-2 active:scale-90 active:border-zinc-600 active:bg-black transition-all"
                                    
                                >
                                    <X size={20} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* LIST VIEW */}
                    {view === 'list' && (
                        <div className="flex flex-col gap-3">
                            {savings.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-zinc-600 text-sm">No savings goals yet</p>
                                    <button onClick={() => setView('form')} className="text-indigo-400 text-xs mt-2">Create your first goal →</button>
                                </div>
                            ) : savings.map(s => {
                                const percent = s.targetAmount > 0 ? (s.savedAmount / s.targetAmount) * 100 : 0
                                const color = s.color || '#6366f1'
                                return (
                                    <div key={s._id}
                                        className="rounded-2xl overflow-hidden"
                                        style={{ background: '#151515', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        {/* Main row */}
                                        <div className="flex items-center gap-3 px-4 py-4">
                                            {/* Icon */}
                                            <button onClick={() => openEdit(s)}
                                                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
                                                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                                            >
                                                <GoalIcon iconKey={s.iconKey} color={color} size={20} />
                                            </button>

                                            {/* Info */}
                                            <button onClick={() => openEdit(s)} className="flex-1 text-left min-w-0">
                                                <p className="text-white text-base font-semibold leading-tight">{s.name}</p>
                                                <p className="text-zinc-500 text-xs mt-0.5">
                                                    ₹{s.savedAmount.toLocaleString('en-IN')} of ₹{s.targetAmount.toLocaleString('en-IN')} saved
                                                </p>
                                                {s.completed && (
                                                    <p className="text-emerald-400 text-[10px] mt-0.5 font-medium">Goal reached !</p>
                                                )}
                                            </button>

                                            {/* Circle + delete */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <CircleProgress  percent={percent} size={52} stroke={5} color={s.completed ? '#10b981' : color} />
                                                <button
                                                    onClick={() => setDeleteConfirm(s._id)}
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                                                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)' }}
                                                >
                                                    <Trash2 size={20} className="text-red-800" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Add money strip */}
                                        {!s.completed && (
                                            <button
                                                onClick={() => { setAddMoneyTarget(s); setAddAmount('') }}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 transition-all active:scale-[0.98]"
                                                style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: `${color}08` }}
                                            >
                                                <PlusCircle size={12} style={{ color }} />
                                                <span className="text-s font-medium" style={{ color }}>Add money</span>
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* FORM VIEW */}
                    {(view === 'form' || view === 'edit') && (
                        <div className="flex flex-col gap-5">

                            {/* Preview */}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                                style={{ background: '#151515', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${form.color}18`, border: `1px solid ${form.color}30` }}>
                                    <GoalIcon iconKey={form.iconKey} color={form.color} size={18} />
                                </div>
                                <p className="text-zinc-400 text-sm">{form.name || 'Goal preview'}</p>
                            </div>                            

                            {/* Icon picker */}
                            <div className='h-40 mb-20'>
                                <p className="text-zinc-500 text-xs mb-3 uppercase">Icon</p>
                                <div className="grid grid-cols-6 gap-5">
                                    {ICONS.map(({ key, Icon }) => {
                                        const selected = form.iconKey === key
                                        return (
                                            <button key={key}
                                                onClick={() => setForm(f => ({ ...f, iconKey: key }))}
                                                className="aspect-square rounded-full flex items-center justify-center transition-all active:scale-90"
                                                style={{
                                                    background: selected ? `${form.color}20` : '#1a1a1a',
                                                    border: selected ? `1.5px solid ${form.color}60` : '1px solid rgba(255,255,255,0.06)',
                                                    boxShadow: selected ? `0 0 12px ${form.color}25` : 'none'
                                                }}
                                            >
                                                <Icon size={28}
                                                    color={selected ? form.color : 'white'}
                                                    strokeWidth={1.8}
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Color picker */}
                            <div>
                                <p className="text-zinc-500 text-xs mb-3 tracking-widest uppercase">Color</p>
                                <div className="flex gap-3">
                                    {COLORS.map(c => (
                                        <button key={c}
                                            onClick={() => setForm(f => ({ ...f, color: c }))}
                                            className="w-8 h-8 rounded-full transition-all active:scale-90 flex items-center justify-center"
                                            style={{
                                                background: c,
                                                boxShadow: form.color === c ? `0 0 0 2px #0e0e0e, 0 0 0 4px ${c}` : 'none',
                                                transform: form.color === c ? 'scale(1.15)' : 'scale(1)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <p className="text-zinc-500 text-xs mb-2 tracking-widest uppercase">Name</p>
                                <input
                                    type="text"
                                    placeholder="e.g. New iPhone, Europe trip..."
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-zinc-900 text-white text-sm rounded-2xl px-4 py-3.5 outline-none border border-zinc-800 focus:border-zinc-600 placeholder:text-zinc-700"
                                />
                            </div>


                            {/*  */}
                            
                            <div className="flex gap-2 w-full">

                                {/* Target */}
                                <div className="flex-1 min-w-0">
                                    <div className="h-9 flex items-start">
                                        <p className="text-zinc-500 text-xs tracking-widest uppercase leading-tight">
                                            Target Amount
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-3.5 border border-zinc-800 focus-within:border-zinc-600">
                                        <span className="text-zinc-500">₹</span>
                                        <input
                                            type="number"
                                            placeholder="50,000"
                                            value={form.targetAmount}
                                            onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-700"
                                        />
                                    </div>
                                </div>

                                {/* Already saved */}
                                <div className="flex-1 min-w-0">
                                    <div className="h-9 flex items-start">
                                        <p className="text-zinc-500 text-xs tracking-widest uppercase leading-tight">
                                            Already Saved{' '}
                                            <span className="text-zinc-700 normal-case">(optional)</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-3.5 border border-zinc-800 focus-within:border-zinc-600">
                                        <span className="text-zinc-500">₹</span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={form.savedAmount}
                                            onChange={e => setForm(f => ({ ...f, savedAmount: e.target.value }))}
                                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-700"
                                        />
                                    </div>
                                </div>

                            </div>
                            

                            <button
                                onClick={view === 'edit' ? handleUpdate : handleCreate}
                                disabled={loading || !form.name.trim() || !form.targetAmount}
                                className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-40"
                                style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}bb)` }}
                            >
                                {loading ? 'Saving...' : view === 'edit' ? 'Save Changes' : 'Create Goal'}
                            </button>
                        </div>
                    )}

                    {/* ADD MONEY MODAL */}
                    <AnimatePresence>
                        {addMoneyTarget && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-60 flex items-end justify-center"
                                style={{ background: 'rgba(0,0,0,0.7)' }}
                                onClick={() => setAddMoneyTarget(null)}
                            >
                                <motion.div
                                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                    onClick={e => e.stopPropagation()}
                                    className="w-full rounded-t-3xl px-5 pt-4 pb-12"
                                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6" />

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: `${addMoneyTarget.color || '#6366f1'}18`, border: `1px solid ${addMoneyTarget.color || '#6366f1'}30` }}>
                                            <GoalIcon iconKey={addMoneyTarget.iconKey || 'target'} color={addMoneyTarget.color || '#6366f1'} size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{addMoneyTarget.name}</p>
                                            <p className="text-zinc-500 text-xs">
                                                ₹{addMoneyTarget.savedAmount.toLocaleString('en-IN')} of ₹{addMoneyTarget.targetAmount.toLocaleString('en-IN')} saved
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-zinc-500 text-xs mb-2 tracking-widest uppercase">Amount to add</p>
                                    <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-4 border border-zinc-800 focus-within:border-zinc-600 mb-4">
                                        <span className="text-zinc-500 text-lg">₹</span>
                                        <input
                                            type="number"
                                            placeholder="500"
                                            value={addAmount}
                                            onChange={e => setAddAmount(e.target.value)}
                                            autoFocus
                                            onFocus={e => setTimeout(() => e.target.scrollIntoView({ 
                                                behavior: 'smooth', 
                                                block: 'center' 
                                            }), 300)}
                                            className="flex-1 bg-transparent text-white text-xl font-semibold outline-none placeholder:text-zinc-700"
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddMoney}
                                        disabled={addLoading || !addAmount}
                                        className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-40"
                                        style={{ background: `linear-gradient(135deg, ${addMoneyTarget.color || '#6366f1'}, ${addMoneyTarget.color || '#6366f1'}bb)` }}
                                    >
                                        {addLoading ? 'Adding...' : `Add ₹${Number(addAmount || 0).toLocaleString('en-IN')} to ${addMoneyTarget.name}`}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* DELETE CONFIRM */}
                    <AnimatePresence>
                        {deleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-60 flex items-center justify-center px-6"
                                style={{ background: 'rgba(0,0,0,0.8)' }}
                            >
                                <motion.div
                                    initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                                    className="rounded-3xl p-6 w-full max-w-sm"
                                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <h3 className="text-white font-semibold text-lg mb-2">Delete this goal?</h3>
                                    <p className="text-zinc-500 text-sm mb-6">All progress will be permanently deleted.</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDeleteConfirm(null)}
                                            className="flex-1 py-3.5 rounded-2xl text-sm text-zinc-400 bg-zinc-800 active:bg-gray-800 transition-all">Cancel</button>
                                        <button onClick={() => handleDelete(deleteConfirm)}
                                            className="flex-1 py-3.5 rounded-2xl bg-red-800 text-sm text-white font-medium active:bg-red-950 transition-all"
                                            >Delete</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}