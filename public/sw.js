console.log('Service Worker Called...');
self.addEventListener('install', (event) => {
    console.log('[Service Worker] : Installed');
    event.waitUntil(caches.open('core').then((cache) => {
        cache.add(new Request('cached.html')).then(() => {
            console.log('[Service Worker] : Cached cached.html')
        });
    }));
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] : Activated');
});

self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] : Fetching');
    const request = event.request;
    if (request.headers.get("Accept").includes("text/html")) {
        event.respondWith(
            fetch(request).then((response) => {
                // Respond with online content
                return response;
            }).catch(() => {
                // Respond with cached content
                return caches.match('cached.html');
            }));
    }
});
