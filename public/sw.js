// Import the idb library for IndexedDB operations
importScripts('https://unpkg.com/idb@5.0.4/build/iife/index-min.js');

// Define constants for cache and IndexedDB names
const CACHE_NAME = 'Plant App v1';
const DB_NAME = 'PlantFindrDB';
const PLANT_STORE_NAME = 'plants';
const CHAT_STORE_NAME = 'chats';
const CHAT_SYNC_TAG = 'sync-chats';
const PLANT_SYNC_TAG = 'sync-plants';

// Event listener for service worker installation
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            // Open cache and add app shell files to cache
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

// Event listener for service worker activation
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            // Delete old caches except the current one
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

// Event listener for fetch requests
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    // Cache the fetched response
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // If fetch fails, serve from cache if available
                return caches.match(event.request);
            })
    );
});

// Event listener for synchronization
self.addEventListener('sync', event => {
    if (event.tag === PLANT_SYNC_TAG) {
        event.waitUntil(syncPlants()); // Sync plant data
    } else if (event.tag === CHAT_SYNC_TAG) {
        event.waitUntil(syncChatMessages()); // Sync chat messages
    }
});

// Open IndexedDB database
async function openDB() {
    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            // Upgrade database schema if needed
            if (!db.objectStoreNames.contains(PLANT_STORE_NAME)) {
                db.createObjectStore(PLANT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
                db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        }
    });
}

// Function to sync plants with the server
async function syncPlants() {
    const db = await openDB();
    const tx = db.transaction(PLANT_STORE_NAME, 'readonly');
    const store = tx.objectStore(PLANT_STORE_NAME);
    const plants = await store.getAll();

    // Send each plant to the server and delete from IndexedDB
    for (const plant of plants) {
        await sendPlantToServer(plant);
        await deleteSyncPlantFromIDB(plant.id);
    }
}

// Function to sync chat messages with the server
async function syncChatMessages() {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE_NAME, 'readonly');
    const store = tx.objectStore(CHAT_STORE_NAME);
    const chats = await store.getAll();

    // Send each chat message to the server and delete from IndexedDB
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

// Function to send plant data to the server
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

// Function to send chat message to the server
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

// Function to delete synced plant data from IndexedDB
async function deleteSyncPlantFromIDB(id) {
    const db = await openDB();
    const tx = db.transaction(PLANT_STORE_NAME, 'readwrite');
    tx.objectStore(PLANT_STORE_NAME).delete(id);
    await tx.done;
}

// Function to delete synced chat message from IndexedDB
async function deleteChatMessageFromIDB(id) {
    const db = await openDB();
    const tx = db.transaction(CHAT_STORE_NAME, 'readwrite');
    tx.objectStore(CHAT_STORE_NAME).delete(id);
    await tx.done;
}

