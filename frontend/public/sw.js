const CACHE_NAME = 'artha-v1'

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.map(k => caches.delete(k)))) // nuke everything on activate
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url)

    // Never cache: API calls, non-GET requests
    if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
        e.respondWith(fetch(e.request))
        return
    }

    // Cache-first for static assets, network-first fallback
    e.respondWith(
        fetch(e.request)
            .then(res => {
                const clone = res.clone()
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
                return res
            })
            .catch(() => caches.match(e.request))
    )
})

self.addEventListener('message', (e) => {
    if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})