const CACHE_NAME = 'Plant App v1';

self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll([
                '/',
                '/javascript/upload.js',
                '/routes/plants.js',
                '/stylesheets/details.css',
                '/stylesheets/style.css',
                '/stylesheets/header.css',
                '/views/partials/_header.ejs',
                '/upload'
            ]);
        }
        catch{
            console.log("error occured while caching...")
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== CACHE_NAME) {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// self.addEventListener('fetch', function(event) {
//     console.log('Service Worker: Fetch', event.request.url);
//     console.log("Url", event.request.url);
//     event.respondWith(
//         caches.match(event.request).then(function(response) {
//             return response || fetch(event.request);
//         })
//     );
// });

//gg NO re
self.addEventListener('fetch', event => {
    event.respondWith(
        // Check network first
        fetch(event.request)
            .then(response => {
                // If response is successful, clone it and update the cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // If network request fails, fetch from cache
                return caches.match(event.request);
            })
    );
});