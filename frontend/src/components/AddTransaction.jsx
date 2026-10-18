// src/components/AddTransaction.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, FileText } from 'lucide-react'
import api from '../api/axios'
import CategoryPicker from './CategoryPicker'
import { useData } from '../context/DataContext'

// Shows budget impact PREVIEW — what the category will look like after this expense
function BudgetImpactPill({ category, type, activeBudget, amount }) {
    if (!activeBudget || type !== 'debit' || !category || category === 'Uncategorized') return null

    const allocation = activeBudget.allocations?.find(a => a.category === category)
    const currentSpent = activeBudget.spent?.[category] || 0
    const parsedAmount = parseFloat(amount) || 0

    if (!allocation) return (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <p className="text-zinc-600 text-xs">Not tracked in your budget</p>
        </motion.div>
    )

    const limit = allocation.limit
    const afterSpent = currentSpent + parsedAmount
    const pctBefore = Math.min(Math.round((currentSpent / limit) * 100), 100)
    const pctAfter = Math.min(Math.round((afterSpent / limit) * 100), 100)
    const isOverAfter = afterSpent > limit
    const wasOver = currentSpent > limit
    const color = isOverAfter ? '#ef4444' : pctAfter >= 80 ? '#f59e0b' : '#10b981'

    return (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="px-3 py-2.5 rounded-xl"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}>

            <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-400 text-xs font-medium">{category} budget</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-zinc-600 text-xs">₹{currentSpent.toLocaleString('en-IN')}</p>
                    {parsedAmount > 0 && (
                        <>
                            <span className="text-zinc-700 text-xs">→</span>
                            <p className="text-xs font-bold" style={{ color }}>
                                ₹{afterSpent.toLocaleString('en-IN')}
                            </p>
                        </>
                    )}
                    <p className="text-zinc-600 text-xs">/ ₹{limit.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Progress bar showing before + after */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden relative">
                {/* Current spent */}
                <div className="absolute top-0 left-0 h-full rounded-full bg-zinc-600"
                    style={{ width: `${pctBefore}%` }} />
                {/* Amount being added */}
                {parsedAmount > 0 && (
                    <motion.div
                        initial={{ width: `${pctBefore}%` }}
                        animate={{ width: `${pctAfter}%` }}
                        transition={{ duration: 0.4 }}
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, #52525b, ${color})`,
                            boxShadow: `0 0 6px ${color}60`
                        }} />
                )}
            </div>

            <div className="flex justify-between mt-1.5">
                {isOverAfter ? (
                    <p className="text-red-400 text-[10px] font-medium">⚠ Will exceed budget by ₹{Math.round(afterSpent - limit).toLocaleString('en-IN')}</p>
                ) : pctAfter >= 80 ? (
                    <p className="text-amber-400 text-[10px]">Will use {pctAfter}% of budget</p>
                ) : (
                    <p className="text-zinc-600 text-[10px]">{pctAfter}% used after this</p>
                )}
                <p className="text-zinc-600 text-[10px]">
                    ₹{Math.max(0, limit - afterSpent).toLocaleString('en-IN')} left
                </p>
            </div>
        </motion.div>
    )
}

function AddTransaction({ isOpen, onClose, onSuccess, onBudgetExceeded }) {
    const { activeBudget, refreshBudget } = useData()
    const [type, setType] = useState('debit')
    const [description, setDescription] = useState('')
    const [note, setNote] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('Uncategorized')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDetails, setShowDetails] = useState(false)

    const getLocalDatetime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        return now.toISOString().slice(0, 16)
    }
    const [date, setDate] = useState(getLocalDatetime())

    useEffect(() => {
        setCategory(type === 'debit' ? 'Uncategorized' : 'Other')
    }, [type])

    useEffect(() => {
        if (isOpen) {
            setDescription(''); setNote(''); setAmount('')
            setCategory(type === 'debit' ? 'Uncategorized' : 'Other')
            setDate(getLocalDatetime()); setError('')
            setShowDetails(false)
        }
    }, [isOpen])

    const handleNumpad = (val) => {
        if (val === '⌫') return setAmount(p => p.slice(0, -1))
        if (val === '.') {
            if (!amount.includes('.')) setAmount(p => p + '.')
            return
        }
        if (amount.length >= 9) return
        setAmount(p => p + val)
    }

    const handleSubmit = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Enter a valid amount')
        if (!description.trim()) return setError('Description is required')
        setLoading(true); setError('')

        // Check budget impact BEFORE submitting so we can notify after
        let willExceed = false
        let exceedCategory = ''
        let exceedBy = 0

        if (activeBudget && type === 'debit' && category !== 'Uncategorized') {
            const allocation = activeBudget.allocations?.find(a => a.category === category)
            if (allocation) {
                const currentSpent = activeBudget.spent?.[category] || 0
                const afterSpent = currentSpent + parseFloat(amount)
                if (afterSpent > allocation.limit) {
                    willExceed = true
                    exceedCategory = category
                    exceedBy = Math.round(afterSpent - allocation.limit)
                }
            }
        }

        try {
            await api.post('/transactions/add', {
                description, amount: parseFloat(amount),
                type, 
                date: new Date(date).toISOString(), 
                category, note,
                merchant: description.split(' ')[0]
            })
            if (activeBudget) await refreshBudget()
            onSuccess()
            onClose()

            // Fire notification AFTER close, if budget was exceeded
            if (willExceed && onBudgetExceeded) {
                setTimeout(() => {
                    onBudgetExceeded(exceedCategory, exceedBy)
                }, 400) // small delay so the sheet closes first
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false) }
    }

    const isExpense = type === 'debit'
    const accentColor = isExpense ? '#ef4444' : '#10b981'
    const accentBg = isExpense ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #059669, #047857)'
    const catType = isExpense ? 'expense' : 'income'

    const displayAmount = amount
        ? `₹${Number(amount.replace(/\.$/, '')).toLocaleString('en-IN')}${amount.endsWith('.') ? '.' : ''}`
        : '₹0'

    const canSubmit = amount && Number(amount) > 0 && description.trim()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
                        style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {/* Accent top bar */}
                        <motion.div
                            animate={{ background: accentColor }}
                            transition={{ duration: 0.3 }}
                            className="h-0.5 w-full"
                        />

                        {/* Drag handle */}
                        <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mt-3 mb-0" />

                        {/* Header row */}
                        <div className="flex items-center justify-between px-5 pt-3 pb-1">
                            <div className="flex bg-zinc-900 rounded-xl p-1 gap-1"
                                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                <button onClick={() => setType('debit')}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={{
                                        background: isExpense ? 'rgba(239,68,68,0.18)' : 'transparent',
                                        color: isExpense ? '#fca5a5' : '#52525b',
                                        border: isExpense ? '1px solid rgba(239,68,68,0.35)' : '1px solid transparent'
                                    }}>
                                    ↓ Expense
                                </button>
                                <button onClick={() => setType('credit')}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={{
                                        background: !isExpense ? 'rgba(16,185,129,0.18)' : 'transparent',
                                        color: !isExpense ? '#6ee7b7' : '#52525b',
                                        border: !isExpense ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent'
                                    }}>
                                    ↑ Income
                                </button>
                            </div>
                            <button onClick={onClose}
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <X size={13} className="text-zinc-400" />
                            </button>
                        </div>

                        {/* Amount */}
                        <div className="text-center px-5 py-3">
                            <motion.p
                                key={`${amount}-${type}`}
                                initial={{ scale: 0.96, opacity: 0.7 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.1 }}
                                className="font-bold tracking-tight tabular-nums"
                                style={{
                                    fontSize: displayAmount.length > 10 ? '2.2rem' : displayAmount.length > 7 ? '2.8rem' : '3.5rem',
                                    lineHeight: 1,
                                    color: amount ? accentColor : 'rgba(255,255,255,0.12)',
                                    textShadow: amount ? `0 0 32px ${accentColor}40` : 'none'
                                }}>
                                {displayAmount}
                            </motion.p>
                        </div>

                        {/* Description */}
                        <div className="px-5 mb-3">
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="What was this for?"
                                className="w-full bg-transparent text-white text-center text-[15px] font-medium placeholder:text-zinc-700 outline-none"
                            />
                        </div>

                        {/* Category + budget impact */}
                        <div className="px-5 mb-3 flex flex-col gap-2">
                            <CategoryPicker
                                value={category}
                                onChange={setCategory}
                                type={catType}
                            />
                            <BudgetImpactPill
                                category={category}
                                type={type}
                                activeBudget={activeBudget}
                                amount={amount}
                            />
                        </div>

                        {/* Collapsible details */}
                        <div className="px-5 mb-2">
                            <button onClick={() => setShowDetails(p => !p)}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all"
                                style={{
                                    background: showDetails ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                                    border: showDetails ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className={showDetails ? 'text-indigo-400' : 'text-zinc-600'} />
                                    <span className="text-xs" style={{ color: showDetails ? '#a5b4fc' : '#52525b' }}>
                                        {note ? `"${note.slice(0, 20)}${note.length > 20 ? '…' : ''}"` : 'Note & date'}
                                    </span>
                                </div>
                                <ChevronDown size={12} className={showDetails ? 'text-indigo-400' : 'text-zinc-600'}
                                    style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                            </button>

                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                        className="overflow-hidden">
                                        <div className="flex flex-col gap-2 pt-2">
                                            <input type="text" value={note} onChange={e => setNote(e.target.value)}
                                                placeholder="Add a note (optional)"
                                                className="w-full bg-zinc-900/70 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder:text-zinc-700"
                                                style={{ border: '1px solid rgba(255,255,255,0.07)' }} />
                                            <input type="datetime-local" value={date}
                                                max={new Date().toISOString().slice(0, 16)}
                                                onChange={e => setDate(e.target.value)}
                                                className="w-full bg-zinc-900/70 text-zinc-400 text-sm rounded-xl px-3 py-2.5 outline-none"
                                                style={{ border: '1px solid rgba(255,255,255,0.07)' }} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && <p className="text-red-400 text-xs text-center px-5 mb-1">{error}</p>}

                        {/* Numpad */}
                        <div className="px-4 pb-2">
                            <div className="grid grid-cols-3 gap-1.5">
                                {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
                                    <motion.button
                                        key={k}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => handleNumpad(k)}
                                        className="flex items-center justify-center font-semibold rounded-2xl transition-colors"
                                        style={{
                                            height: '50px',
                                            fontSize: k === '⌫' ? '16px' : '20px',
                                            background: k === '⌫'
                                                ? 'rgba(255,255,255,0.04)'
                                                : 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            color: k === '⌫' ? '#71717a' : '#e4e4e7'
                                        }}>
                                        {k}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="px-4 pb-8 pt-2">
                            <motion.button
                                onClick={handleSubmit}
                                disabled={loading || !canSubmit}
                                whileTap={canSubmit ? { scale: 0.97 } : {}}
                                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all"
                                style={{
                                    background: canSubmit ? accentBg : 'rgba(255,255,255,0.05)',
                                    color: canSubmit ? 'white' : '#3f3f46',
                                    boxShadow: canSubmit ? `0 0 28px ${accentColor}35` : 'none',
                                    opacity: loading ? 0.7 : 1
                                }}>
                                {loading ? 'Logging...' : `Log ${isExpense ? 'Expense' : 'Income'}`}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddTransaction