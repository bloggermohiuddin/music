const CACHE_NAME = 'audivo-v2';
const STATIC_CACHE = 'music-static-v2';
const AUDIO_CACHE = 'music-audio-v2';
const THUMB_CACHE = 'music-thumbnails-v2';

const STATIC_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/app.js',
    '/js/router.js',
    '/js/store.js',
    '/js/db.js',
    '/js/player.js',
    '/js/utils.js',
    '/js/theme.js',
    '/js/worker.js',
    '/js/components/header.js',
    '/js/components/sidebar.js',
    '/js/components/home.js',
    '/js/components/library.js',
    '/js/components/player.js',
    '/js/components/search.js',
    '/js/components/downloads.js',
    '/js/components/playlists.js',
    '/js/components/settings.js',
    '/js/components/history.js',
    '/js/components/favorites.js',
    '/js/components/miniplayer.js',
    '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_URLS).catch(err => {
                console.warn('Some static files failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== STATIC_CACHE && name !== AUDIO_CACHE && name !== THUMB_CACHE && name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    if (url.origin === 'https://bloggermahim.serv00.net') {
        event.respondWith(networkFirst(request));
        return;
    }

    if (request.destination === 'audio' || request.destination === 'media' ||
        url.pathname.match(/\.(mp3|m4a|wav|aac|ogg|flac)$/i)) {
        event.respondWith(audioCacheFirst(request));
        return;
    }

    if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        event.respondWith(imageCacheFirst(request));
        return;
    }

    if (request.destination === 'style' || request.destination === 'script' ||
        request.destination === 'font' || request.destination === 'document') {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/yt/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);
    return cached || network;
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

async function audioCacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(AUDIO_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        return new Response('Audio offline', { status: 503 });
    }
}

async function imageCacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(THUMB_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        return cached || new Response('', { status: 204 });
    }
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-downloads') {
        event.waitUntil(syncDownloads());
    }
});

async function syncDownloads() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_DOWNLOADS' });
    });
}
