// src/context/DataContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const DataContext = createContext(null)

export function DataProvider({ children }) {
    const [transactions, setTransactions] = useState([])
    const [stats, setStats] = useState(null)
    const [user, setUser] = useState({})
    const [savings, setSavings] = useState([])
    const [activeBudget, setActiveBudget] = useState(null)
    const [categories, setCategories] = useState({ expense: [], income: [] })
    const [loading, setLoading] = useState(true)

    const fetchCategories = async () => {
        try {
            const [expRes, incRes] = await Promise.all([
                api.get('/categories?type=expense'),
                api.get('/categories?type=income'),
            ])
            setCategories({
                expense: expRes.data,
                income: incRes.data,
            })
        } catch (err) {
            console.warn('Categories fetch failed:', err.message)
        }
    }

    const fetchAll = async () => {
        try {
            const [txRes, statsRes, userRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/transactions/stats'),
                api.get('/auth/me'),
            ])
            setTransactions(txRes.data)
            setStats(statsRes.data)
            setUser(userRes.data)
        } catch (err) {
            console.error('DataContext fetch error:', err)
        } finally {
            setLoading(false)
        }

        try {
            const savingsRes = await api.get('/savings')
            setSavings(savingsRes.data)
        } catch (err) {
            setSavings([])
        }

        try {
            const budgetRes = await api.get('/budget/active')
            setActiveBudget(budgetRes.data)
        } catch (err) {
            setActiveBudget(null)
        }

        await fetchCategories()
    }

    useEffect(() => { fetchAll() }, [])

    const refreshData = async () => {
        const [txRes, statsRes] = await Promise.all([
            api.get('/transactions'),
            api.get('/transactions/stats')
        ])
        setTransactions(txRes.data)
        setStats(statsRes.data)
    }

    const refreshSavings = async () => {
        try {
            const res = await api.get('/savings')
            setSavings(res.data)
        } catch (err) {
            console.warn('refreshSavings failed:', err.message)
        }
    }

    const refreshUser = async () => {
        const res = await api.get('/auth/me')
        setUser(res.data)
    }

    const refreshBudget = async () => {
        try {
            const res = await api.get('/budget/active')
            setActiveBudget(res.data)
        } catch (err) {
            setActiveBudget(null)
        }
    }

    const refreshCategories = fetchCategories

    return (
        <DataContext.Provider value={{
            transactions,
            stats,
            user,
            savings,
            activeBudget,
            categories,           // { expense: [...], income: [...] }
            loading,
            refreshData,
            refreshSavings,
            refreshUser,
            refreshBudget,
            refreshCategories,
        }}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => useContext(DataContext)