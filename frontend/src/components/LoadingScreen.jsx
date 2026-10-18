import { useEffect, useRef } from 'react'

const STEPS = [
    { main: 'Waking up',          sub: 'Connecting to your account',     pct: 10 },
    { main: 'Fetching your data', sub: 'Pulling in transactions',         pct: 30 },
    { main: 'Crunching numbers',  sub: "Calculating this month's stats",  pct: 50 },
    { main: 'Loading savings',    sub: 'Checking your goals',             pct: 65 },
    { main: 'Syncing profile',    sub: 'Getting your plan details',       pct: 80 },
    { main: 'Almost there',       sub: 'Putting it all together',         pct: 95 },
]

export default function LoadingScreen() {
    const canvasRef = useRef()
    const stepRef = useRef(0)

    useEffect(() => {
        // Status cycling
        const mainEl = document.getElementById('ls-main')
        const subEl = document.getElementById('ls-sub')
        const fillEl = document.getElementById('ls-fill')

        function nextStep() {
            const s = STEPS[stepRef.current]
            if (!s) return
            mainEl.style.opacity = 0
            setTimeout(() => {
                mainEl.textContent = s.main
                subEl.textContent = s.sub
                fillEl.style.width = s.pct + '%'
                mainEl.style.opacity = 1
            }, 200)
            stepRef.current++
        }

        nextStep()
        const interval = setInterval(nextStep, 1600)

        // Juggling animation
        const wrap = canvasRef.current
        if (!wrap) return

        const balls = [0, 1, 2].map((_, i) => {
            const b = document.createElement('div')
            b.style.cssText = `position:absolute;width:12px;height:12px;border-radius:50%;background:${['#ffffff','#71717a','#3f3f46'][i]}`
            wrap.appendChild(b)
            return b
        })

        const cx = 40, cy = 40, r = 32
        const angles = [270, 30, 150]
        let t = 0, rafId

        function pos(a) {
            const rad = a * Math.PI / 180
            return { x: cx + r * Math.cos(rad) - 6, y: cy + r * Math.sin(rad) - 6 }
        }

        function animate() {
            t += 0.012
            balls.forEach((b, i) => {
                const angle = t + (i / 3) * Math.PI * 2
                const progress = ((angle % (Math.PI * 2)) / (Math.PI * 2)) * 3
                const from = Math.floor(progress) % 3
                const to = (from + 1) % 3
                const frac = progress - Math.floor(progress)
                const e = frac < 0.5 ? 2 * frac * frac : 1 - Math.pow(-2 * frac + 2, 2) / 2
                const p0 = pos(angles[from]), p1 = pos(angles[to])
                const mx = (p0.x + p1.x) / 2
                const my = (p0.y + p1.y) / 2 - 14 * Math.sin(Math.PI * e)
                const bx = (1-e)*(1-e)*p0.x + 2*(1-e)*e*mx + e*e*p1.x
                const by = (1-e)*(1-e)*p0.y + 2*(1-e)*e*my + e*e*p1.y
                b.style.left = bx + 'px'
                b.style.top = by + 'px'
                b.style.transform = `scale(${0.85 + 0.3 * Math.sin(Math.PI * e)})`
            })
            rafId = requestAnimationFrame(animate)
        }

        animate()
        return () => { clearInterval(interval); cancelAnimationFrame(rafId) }
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-12"
            style={{ background: '#080808' }}>

            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>
                Artha
            </p>

            <div ref={canvasRef} style={{ position: 'relative', width: 80, height: 80 }} />

            <div className="flex flex-col items-center gap-1.5">
                <p id="ls-main" className="text-white text-sm font-medium tracking-wide"
                    style={{ transition: 'opacity 0.3s ease' }}>
                    Waking up
                </p>
                <p id="ls-sub" className="text-zinc-600 text-xs tracking-widest">
                    Connecting to your account
                </p>
                <div style={{ width: 120, height: 1, background: '#1f1f1f', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
                    <div id="ls-fill" style={{ height: '100%', background: '#fff', borderRadius: 1, width: '10%', transition: 'width 0.4s ease' }} />
                </div>
            </div>
        </div>
    )
}