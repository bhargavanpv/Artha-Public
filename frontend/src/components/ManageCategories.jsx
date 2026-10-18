// src/components/ManageCategories.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Check, Pencil } from 'lucide-react'
import api from '../api/axios'
import { useData } from '../context/DataContext'

function ManageCategories({ isOpen, onClose }) {
    const { categories, refreshCategories } = useData()
    const [tab, setTab] = useState('expense')
    const [newName, setNewName] = useState('')
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

    const list = tab === 'expense' ? categories.expense : categories.income

    const handleAdd = async () => {
        const trimmed = newName.trim()
        if (!trimmed) return
        setSaving(true)
        try {
            await api.post('/categories', { name: trimmed, type: tab })
            setNewName(''); setAdding(false)
            await refreshCategories()
            showToast('Category added')
        } catch (err) {
            showToast(err.response?.data?.message || 'Already exists')
        } finally { setSaving(false) }
    }

    const handleEdit = async (id) => {
        const trimmed = editName.trim()
        if (!trimmed) return
        setSaving(true)
        try {
            await api.patch(`/categories/${id}`, { name: trimmed })
            setEditingId(null)
            await refreshCategories()
            showToast('Updated')
        } catch (err) { showToast('Failed') }
        finally { setSaving(false) }
    }

    const handleDelete = async (cat) => {
        if (cat.isDefault) return showToast("Can't delete default categories")
        try {
            await api.delete(`/categories/${cat._id}`)
            await refreshCategories()
            showToast('Deleted')
        } catch (err) { showToast('Failed') }
    }

    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full rounded-t-3xl px-5  pb-10"
                style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.07)',
                    maxHeight: '85vh', overflowY: 'auto', scrollbarWidth: 'none'
                }}
            >
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-2xl text-sm text-white whitespace-nowrap"
                            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                

                <div className='sticky top-0 z-50 pt-3 bg-[#0d0d0d]'>
                    <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mb-5" />
                    <div className="flex items-center justify-between mb-5">
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-white text-2xl font-bold">
                            Manage Categories
                        </p>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <X size={13} className="text-zinc-400" />
                        </button>
                    </div>

                    {/* Tab */}
                    <div className="flex bg-zinc-900 rounded-2xl p-1 mb-5"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        {['expense', 'income'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: tab === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    color: tab === t ? '#a5b4fc' : '#71717a',
                                    border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent'
                                }}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <AnimatePresence>
                    {adding ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 mb-2">
                            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                className="flex-1 bg-zinc-900 text-white text-sm rounded-xl px-3 h-10 outline-none"
                                placeholder={`New ${tab} category...`} />
                            <button onClick={handleAdd} disabled={saving || !newName.trim()}
                                className="px-4 h-10 rounded-xl text-xs font-semibold text-white"
                                style={{ background: 'rgba(99,102,241,0.2)' }}>
                                {saving ? '...' : 'Add'}
                            </button>
                            <button onClick={() => { setAdding(false); setNewName('') }}
                                className="w-9 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <X size={13} className="text-zinc-500" />
                            </button>
                        </motion.div>
                    ) : (
                        <button onClick={() => setAdding(true)}
                            className="w-full flex items-center bg-zinc-900 border-1  mb-2 justify-center gap-2 py-3.5 rounded-2xl text-sm text-zinc-400 active:scale-95"
                            >
                            <Plus size={14} style={{color: tab === 'expense' ? 'lightblue' : '#71717a',}} />
                            Add {tab} category
                        </button>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-2 mb-4">
                    <AnimatePresence>
                        {[...list]
                            .sort((a, b) => a.isDefault - b.isDefault)
                            .map(cat => (
                            <motion.div key={cat._id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }} layout
                                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                                style={{
                                    background: '#111111',
                                    border: cat.isDefault
                                        ? '1px solid rgba(255,255,255,0.04)'
                                        : '1px solid rgba(255,255,255,0.06)'
                                }}>
                                {editingId === cat._id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input autoFocus value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleEdit(cat._id)}
                                            className="flex-1 bg-zinc-900 text-white text-sm rounded-xl px-3 py-1.5 outline-none"
                                            style={{ border: '1px solid rgba(99,102,241,0.4)' }} />
                                        <button onClick={() => handleEdit(cat._id)} disabled={saving}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(99,102,241,0.2)' }}>
                                            <Check size={12} className="text-indigo-400" />
                                        </button>
                                        <button onClick={() => setEditingId(null)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <X size={12} className="text-zinc-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-1 h-8 rounded-full flex-shrink-0"
                                                style={{
                                                    backgroundColor: tab === 'expense' ? '#ef4444' : '#10b981',
                                                    opacity: cat.isDefault ? 0.3 : 1
                                                }} />
                                            <p className={`text-sm font-medium ${cat.isDefault ? 'text-zinc-600' : 'text-white'}`}>
                                                {cat.name}
                                            </p>
                                            {cat.isDefault && (
                                                <span className="text-[9px] text-zinc-700 px-1.5 py-0.5 rounded-md"
                                                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                    default
                                                </span>
                                            )}
                                        </div>
                                        {!cat.isDefault && (
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => { setEditingId(cat._id); setEditName(cat.name) }}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90"
                                                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                    <Pencil size={11} className="text-zinc-500" />
                                                </button>
                                                <button onClick={() => handleDelete(cat)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90"
                                                    style={{ background: 'rgba(239,68,68,0.08)' }}>
                                                    <Trash2 size={11} className="text-red-500" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ManageCategories