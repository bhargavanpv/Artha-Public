export function registerSW() {
    if (!('serviceWorker' in navigator)) return

    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js')

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing

                newWorker.addEventListener('statechange', () => {
                    if (
                        newWorker.state === 'installed' &&
                        navigator.serviceWorker.controller
                    ) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' })
                    }
                })
            })

            setInterval(() => reg.update(), 60 * 1000)

        } catch (err) {
            console.error('SW registration failed:', err)
        }
    })

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
    })
}