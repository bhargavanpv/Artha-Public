// src/hooks/useCategories.js
// Single source of truth for user's categories
// Usage: const { expense, income, all, loading, refresh } = useCategories()

import { useState, useEffect } from 'react'
import api from '../api/axios'

export function useCategories() {
    const [expense, setExpense] = useState([])
    const [income, setIncome] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAll = async () => {
        try {
            const [expRes, incRes] = await Promise.all([
                api.get('/categories?type=expense'),
                api.get('/categories?type=income'),
            ])
            setExpense(expRes.data)
            setIncome(incRes.data)
        } catch (err) {
            console.error('useCategories failed', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    return {
        expense,           // [{_id, name, type, isDefault}, ...]
        income,
        all: [...expense, ...income],
        expenseNames: expense.map(c => c.name),   // ['Food & Dining', 'Groceries', ...]
        incomeNames: income.map(c => c.name),
        loading,
        refresh: fetchAll,
    }
}