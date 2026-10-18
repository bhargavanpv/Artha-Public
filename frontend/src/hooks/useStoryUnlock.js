import { useMemo } from 'react'

export function useStoryUnlock(user, transactions) {
    return useMemo(() => {
        const txCount = transactions?.length || 0
        const REQUIRED_TXN = 20
        const REQUIRED_DAYS = 7

        const joinDate = user?.createdAt ? new Date(user.createdAt) : null
        const now = new Date()
        const daysSinceJoin = joinDate
            ? Math.floor((now - joinDate) / (1000 * 60 * 60 * 24))
            : 0

        const txProgress = Math.min(txCount / REQUIRED_TXN, 1)
        const dayProgress = Math.min(daysSinceJoin / REQUIRED_DAYS, 1)

        const txUnlocked = txCount >= REQUIRED_TXN
        const daysUnlocked = daysSinceJoin >= REQUIRED_DAYS

        // Is today the last day (day 6, unlocks tomorrow)
        const isLastDay = daysSinceJoin === REQUIRED_DAYS - 1

        // Time until midnight of unlock day
        const unlockDate = joinDate ? new Date(joinDate) : null
        if (unlockDate) {
            unlockDate.setDate(unlockDate.getDate() + REQUIRED_DAYS)
            unlockDate.setHours(0, 0, 0, 0)
        }

        const fullyUnlocked = txUnlocked && daysUnlocked

        return {
            txCount,
            txProgress,
            txUnlocked,
            dayProgress,
            daysUnlocked,
            daysSinceJoin,
            isLastDay,
            unlockDate,
            fullyUnlocked,
            REQUIRED_TXN,
            REQUIRED_DAYS,
        }
    }, [user, transactions])
}