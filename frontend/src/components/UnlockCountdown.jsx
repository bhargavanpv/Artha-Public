import { useState, useEffect } from 'react'

export function UnlockCountdown({ unlockDate }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const tick = () => {
            const now = new Date()
            const diff = unlockDate - now
            if (diff <= 0) {
                setTimeLeft('Unlocking...')
                return
            }
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            )
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [unlockDate])

    return (
        <span className="font-mono text-indigo-400 font-bold">{timeLeft}</span>
    )
}