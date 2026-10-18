// src/components/CategoryPicker.jsx
// Uses global DataContext categories — no separate fetch needed
// Props:
//   value: string
//   onChange: (name: string) => void
//   type: 'expense' | 'income'
//   placeholder?: string

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Check, X } from 'lucide-react'
import api from '../api/axios'
import { useData } from '../context/DataContext'

function CategoryPicker({ value, onChange, type = 'expense', placeholder = 'Select category' }) {
    const { categories, refreshCategories } = useData()
    const [open, setOpen] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const ref = useRef(null)

    // Get the right list from global context
    const list = type === 'expense' ? categories.expense : categories.income

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
                setShowNew(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (name) => {
        onChange(name)
        setOpen(false)
        setShowNew(false)
    }

    const handleCreate = async () => {
        const trimmed = newName.trim()
        if (!trimmed) return
        setCreating(true)
        try {
            await api.post('/categories', { name: trimmed, type })
            await refreshCategories()   // update global context
            handleSelect(trimmed)
            setNewName('')
            setShowNew(false)
        } catch (err) {
            // duplicate — just select it
            handleSelect(trimmed)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-center py-3 px-4 rounded-2xl text-sm transition-all"
                style={{
                    background: '#1a1a1a',
                    border: open
                        ? '1px solid rgba(99,102,241,0.4)'
                        : '1px solid rgba(255,255,255,0.06)'
                }}
            >
                <span className={value ? 'text-white' : 'text-zinc-600'}>{value || placeholder}</span>
                <ChevronDown size={15} className="text-zinc-500 flex-shrink-0"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl z-50"
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
                            maxHeight: '240px',
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {list.length === 0 && (
                            <p className="text-zinc-600 text-xs text-center py-4">No categories yet</p>
                        )}

                        {list.map(cat => (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => handleSelect(cat.name)}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all"
                                style={{
                                    background: value === cat.name ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    color: value === cat.name ? '#a5b4fc' : '#d4d4d8',
                                }}
                            >
                                <span>{cat.name}</span>
                                {value === cat.name && <Check size={13} className="text-indigo-400" />}
                            </button>
                        ))}

                        <div className="h-px bg-white/5 mx-3" />

                        {!showNew ? (
                            <button
                                type="button"
                                onClick={() => setShowNew(true)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-indigo-400"
                            >
                                <Plus size={12} />
                                Create new category
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleCreate()
                                        if (e.key === 'Escape') setShowNew(false)
                                    }}
                                    placeholder="Category name..."
                                    className="flex-1 bg-zinc-900 text-white text-xs rounded-xl px-3 py-2 outline-none"
                                    style={{ border: '1px solid rgba(99,102,241,0.3)' }}
                                />
                                <button onClick={handleCreate} disabled={creating || !newName.trim()}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                                    <Check size={12} className="text-indigo-400" />
                                </button>
                                <button onClick={() => { setShowNew(false); setNewName('') }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <X size={12} className="text-zinc-500" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CategoryPicker