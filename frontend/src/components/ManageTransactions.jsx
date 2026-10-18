import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import CategoryPicker from './CategoryPicker'

function ManageTransaction({ onClose, onUpdate, categories }) {
    const [transactions, setTransactions] = useState([])
    const [filtered, setFiltered] = useState([])
    const [typeFilter, setTypeFilter] = useState('all')
    const [sortOrder, setSortOrder] = useState('desc')
    const [editingTransaction, setEditingTransaction] = useState(null)

    useEffect(() => {
        api.get('/transactions').then(res => setTransactions(res.data))
    }, [])

    useEffect(() => {
        let result = [...transactions]
        if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter)
        result.sort((a, b) => sortOrder === 'desc'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date)
        )
        setFiltered(result)
    }, [transactions, typeFilter, sortOrder])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <div className="w-[92%] h-[88%] rounded-3xl flex flex-col overflow-hidden"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3 border-b border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <div className='flex flex-col'>
                            <h2 className="text-white font-semibold text-xl">All Transactions</h2>
                            <span  className="text-zinc-500 text-[10px]">Click a transaction to edit </span>
                        </div>
                        <button onClick={onClose} className="text-zinc-200 bg-gray-950 px-8 py-2 flex items-center justify-center rounded-2xl text-m cursor-pointer">
                            ✕
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {['all', 'credit', 'debit'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-5 py-2 rounded-xl text-xs font-medium transition-all ${
                                        typeFilter === type
                                            ? type === 'credit'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : type === 'debit'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-white/20 text-white'
                                            : 'text-zinc-400 bg-zinc-900'
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center gap-1 text-zinc-400 text-xs bg-zinc-900 px-3 py-2 rounded-full"
                        >
                            Date {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                    {filtered.length === 0 ? (
                        <p className="text-zinc-600 text-sm text-center py-8">No transactions found</p>
                    ) : (
                        filtered.map((t, index) => (
                            <motion.div key={t._id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.15 }}
                            className="bg-zinc-950 rounded-xl flex items-center px-3 py-3 relative cursor-pointer"
                            onClick={() => setEditingTransaction(t)}
                        >
                            {/* Color bar */}
                            <span className="w-1.5 h-10 rounded-full flex-shrink-0 mr-3"
                                style={{ backgroundColor: t.type === 'credit' ? '#10b981' : '#ef4444' }}
                            />

                            {/* Description + Category — takes remaining space */}
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-white text-sm font-medium truncate">{t.description}</p>
                                <p className="text-zinc-600 text-xs mt-0.5">{t.category}</p>
                            </div>

                            {/* Date + Time — fixed width */}
                            <div className="flex flex-col items-end w-24 flex-shrink-0">
                                <p className="text-zinc-400 text-xs">{formatDate(t.date)}</p>
                                <p className="text-zinc-600 text-xs mt-0.5">{formatTime(t.date)}</p>
                            </div>

                            {/* Amount — fixed width, right aligned */}
                            <div className="w-24 flex-shrink-0 text-right pl-2">
                                <p className={`text-sm font-semibold ${t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </motion.div>
                        ))
                    )}
                </div>
            </div>

            {editingTransaction && (
                <div className="fixed inset-0 z-60 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setEditingTransaction(null)} />
                    <div className="relative w-full max-w-md rounded-t-3xl px-6 pt-4 pb-10 z-10"
                        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />
                        <h3 className="text-white font-semibold text-sm mb-5">Edit Transaction</h3>

                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Description</p>
                                <input type="text" value={editingTransaction.description}
                                    onChange={e => setEditingTransaction(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none border border-zinc-800 focus:border-zinc-600"
                                />
                            </div>

                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Amount</p>
                                <input type="number" value={editingTransaction.amount}
                                    onChange={e => setEditingTransaction(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none border border-zinc-800 focus:border-zinc-600"
                                />
                            </div>

                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Type</p>
                                <div className="flex gap-2">
                                    {['credit', 'debit'].map(type => (
                                        <button key={type}
                                            onClick={() => setEditingTransaction(prev => ({ ...prev, type }))}
                                            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                                                editingTransaction.type === type
                                                    ? type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                    : 'bg-zinc-900 text-zinc-500'
                                            }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Category</p>

                                <CategoryPicker
                                    value={editingTransaction.category}
                                    onChange={(category) =>
                                        setEditingTransaction(prev => ({
                                            ...prev,
                                            category
                                        }))
                                    }
                                    type={editingTransaction.type === 'credit' ? 'income' : 'expense'}
                                    placeholder="Select category"
                                />
                            </div>

                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Date</p>
                                <input type="date"
                                    value={editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : ''}
                                    onChange={e => setEditingTransaction(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none border border-zinc-800 focus:border-zinc-600"
                                />
                            </div>

                            <div>
                                <p className="text-zinc-500 text-xs mb-1">Time <span className="text-zinc-600">(optional)</span></p>
                                <input type="time"
                                    value={editingTransaction.date ? new Date(editingTransaction.date).toTimeString().slice(0, 5) : ''}
                                    onChange={e => {
                                        const existingDate = new Date(editingTransaction.date)
                                        const [hours, minutes] = e.target.value.split(':')
                                        existingDate.setHours(hours, minutes)
                                        setEditingTransaction(prev => ({ ...prev, date: existingDate.toISOString() }))
                                    }}
                                    className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2.5 outline-none border border-zinc-800 focus:border-zinc-600"
                                />
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await api.patch(`/transactions/${editingTransaction._id}`, editingTransaction)
                                    setTransactions(prev => prev.map(t => t._id === res.data._id ? res.data : t))
                                    setEditingTransaction(null)
                                    onUpdate()
                                } catch (err) { console.error(err) }
                            }}
                            className="w-full bg-white text-black text-sm font-semibold rounded-2xl py-3 mt-6"
                        >
                            Save Changes
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    await api.delete(`/transactions/${editingTransaction._id}`)
                                    setTransactions(prev => prev.filter(t => t._id !== editingTransaction._id))
                                    setEditingTransaction(null)
                                    onUpdate()
                                } catch (err) { console.error(err) }
                            }}
                            className="w-full text-red-400 text-sm py-3 mt-2"
                        >
                            Delete Transaction
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default ManageTransaction