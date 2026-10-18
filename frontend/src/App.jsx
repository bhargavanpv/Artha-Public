import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import ArthaAI from './pages/ArthaAI'
import Charts from './pages/Charts'
import Profile from './pages/Profile'
import Story from './pages/Story.jsx'
import Budget from './pages/Budget'
import PrivacyPolicy from './pages/PolicyPage'
import TermsOfService from './pages/TermsPage'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from "./components/LoadingScreen"
import SetBalancePopup from './components/SetBalancePopup'
import { useAppTour } from './components/AppTour'
import InAppNotification from './components/InAppNotification'
import Changelog from './components/ChangeLog'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { AnimatePresence } from 'framer-motion'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useData } from "./context/DataContext"
import { useEffect, useState } from 'react'
import api from './api/axios'

function App() {
    const { loading, user } = useData()
    const { startTour } = useAppTour()
    const [showChangelog, setShowChangelog] = useState(false)
    const [showBalancePopup, setShowBalancePopup] = useState(false)

    const token = localStorage.getItem('token')

    // Tour logic
    useEffect(() => {
        if (loading) return
        if (!token) return
        if (!user?.email) return 
        
        const isNewUser = localStorage.getItem('artha-new-user')
        if (isNewUser) {
            localStorage.removeItem('artha-new-user')
            setTimeout(() => startTour(), 1000)
            return
        }

        const alreadyDone = localStorage.getItem('artha-tour-done')
        if (alreadyDone) return

        api.get('/auth/me').then(res => {
            if (!res.data.tourCompleted) {
                setTimeout(() => startTour(), 600)
            }
        }).catch(() => {})
    }, [loading])

    // Balance popup logic — show once if user hasn't set balance
    useEffect(() => {
        if (loading) return
        if (!token) return
        if (!user) return

        const alreadyPrompted = localStorage.getItem('artha-balance-set')
        if (alreadyPrompted) return

        // show popup only if user has transactions but hasn't set a balance
        if (!user.hasSetBalance) {
            // small delay so dashboard renders first
            setTimeout(() => setShowBalancePopup(true), 1200)
        } else {
            localStorage.setItem('artha-balance-set', 'true')
        }
    }, [loading, user])

    // Only show loading screen for authenticated pages
    if (loading && token) return <LoadingScreen />

    return (
        <>
            {token && <InAppNotification onShowChangelog={() => setShowChangelog(true)} />}

            <AnimatePresence>
                {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
            </AnimatePresence>

            {/* One-time balance setup popup */}
            <AnimatePresence>
                {showBalancePopup && (
                    <SetBalancePopup onDone={() => setShowBalancePopup(false)} />
                )}
            </AnimatePresence>

            <Routes>
                <Route path='/' element={token ? <Navigate to="/home" /> : <Landing />} />
                <Route path='/login' element={<Login />} />
                <Route path='/cmd' element={<AdminDashboard />} />
                <Route path='/register' element={<Register />} />
                <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path='/ai' element={<ProtectedRoute><ArthaAI /></ProtectedRoute>} />
                <Route path='/charts' element={<ProtectedRoute><Charts /></ProtectedRoute>} />
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path='/budget' element={<ProtectedRoute><Budget /></ProtectedRoute>} />
                <Route path='/story' element={<ProtectedRoute><Story /></ProtectedRoute>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
            </Routes>
        </>
    )
}

export default App