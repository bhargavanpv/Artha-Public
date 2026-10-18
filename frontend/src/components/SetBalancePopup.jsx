// src/components/SetBalancePopup.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import api from '../api/axios'
import { useData } from '../context/DataContext'

function SetBalancePopup({ onDone }) {
    const { stats, refreshUser } = useData()
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)

    // pre-fill with their current Artha-calculated balance
    const arthaBalance = stats?.netCashFlow || 0

    const handleSave = async () => {
        const amount = value === '' ? arthaBalance : Number(value)
        setSaving(true)
        try {
            await api.put('/auth/profile', {
                manualBalance: amount,
                balanceSetDate: new Date(),
                hasSetBalance: true,
            })
            await refreshUser()
            localStorage.setItem('artha-balance-set', 'true')
            onDone()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleSkip = async () => {
        // skip — use Artha's auto calculation, don't set hasSetBalance
        localStorage.setItem('artha-balance-set', 'true')
        onDone()
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-8"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                className="w-full rounded-3xl p-6"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                    <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-3xl font-bold leading-tight">
                        What's your<br />current balance?
                    </p>
                    <button
                        onClick={handleSkip}
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <X size={13} className="text-zinc-500" />
                    </button>
                </div>

                <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                    Artha will track everything from this point forward. You can change this anytime in Profile.
                </p>

                {/* Artha's current reading */}
                <button
                    onClick={() => setValue(String(arthaBalance))}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-3 transition-all active:scale-[0.98]"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                    <div className="text-left">
                        <p className="text-zinc-400 text-xs mb-0.5">Artha's current reading</p>
                        <p className="text-white text-lg font-bold">
                            ₹{arthaBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <p className="text-indigo-400 text-xs">Use this →</p>
                </button>

                {/* Manual input */}
                <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    <span className="text-zinc-400 text-lg font-medium">₹</span>
                    <input
                        type="number"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="flex-1 bg-transparent text-white text-xl font-bold outline-none placeholder:text-zinc-700"
                        placeholder="Enter your actual balance"
                        autoFocus
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSkip}
                        className="flex-1 py-3.5 rounded-2xl text-sm text-zinc-500 transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? 'Saving...' : 'Set Balance'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default SetBalancePopup