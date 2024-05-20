importScripts('https://unpkg.com/idb@5.0.4/build/iife/index-min.js');

const CACHE_NAME = 'Plant App v1';
const DB_NAME = 'PlantFindrDB';
const PLANT_STORE_NAME = 'plants';
const CHAT_STORE_NAME = 'chats';
const CHAT_SYNC_TAG = 'sync-chats';
const PLANT_SYNC_TAG = 'sync-plants';

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
        } catch (err) {
            console.log("Error occurred while caching:", err);
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return Promise.all(
                keys.map(async (cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Removing old cache: ' + cache);
                        return await caches.delete(cache);
                    }
                })
            );
        })()
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === PLANT_SYNC_TAG) {
        event.waitUntil(syncPlants());
    } else if (event.tag === CHAT_SYNC_TAG) {
        event.waitUntil(syncChatMessages());
    }
});

async function openDB() {
    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(PLANT_STORE_NAME)) {
                db.createObjectStore(PLANT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
                db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        }
    });
}

async function syncPlants() {
    const db = await openDB();
    const tx = db.transaction(PLANT_STORE_NAME, 'readonly');
    const store = tx.objectStore(PLANT_STORE_NAME);
    const plants = await store.getAll();

    for (const plant of plants) {
        await sendPlantToServer(plant);
        await deleteSyncPlantFromIDB(plant.id);
    }
}

async function syncChatMessages() {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE_NAME, 'readonly');
    const store = tx.objectStore(CHAT_STORE_NAME);
    const chats = await store.getAll();

    for (const chat of chats) {
        try {
            console.log('Syncing chat:', chat);
            await sendChatMessageToServer(chat);
            await deleteChatMessageFromIDB(chat.id);
            console.log('Successfully synced and deleted chat:', chat);
        } catch (err) {
            console.error('Error syncing chat message:', err, chat);
        }
    }
}

async function sendPlantToServer(plant) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plant)
        });
        return response.json();
    } catch (err) {
        console.error('Error sending plant to server:', err);
    }
}

async function sendChatMessageToServer(chat) {
    try {
        const response = await fetch('/sync-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chat)
        });
        return response.json();
    } catch (err) {
        console.error('Error sending chat message to server:', err);
    }
}

async function deleteSyncPlantFromIDB(id) {
    const db = await openDB();
    const tx = db.transaction(PLANT_STORE_NAME, 'readwrite');
    tx.objectStore(PLANT_STORE_NAME).delete(id);
    await tx.done;
}

async function deleteChatMessageFromIDB(id) {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE_NAME, 'readwrite');
    tx.objectStore(CHAT_STORE_NAME).delete(id);
    await tx.done;
}

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
