// When the DOM content is loaded, execute this function
document.addEventListener("DOMContentLoaded", (event) => {
    // Initialize socket.io connection
    const socket = io();

    // Get plantID and username from the DOM
    const plantID = document.getElementById('plantID').value;
    const username = document.getElementById('username').value;

    // Get input field, chat message container, and send button from the DOM
    const input = document.getElementById('chat_input');
    const messages = document.getElementById('chat-messages');
    const sendButton = document.querySelector('.chat-input button');

    // Function to format timestamp to a readable format
    function formatDate(date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    }

    // Function to send chat message
    async function sendChatText() {
        if (input.value) {
            const chatMessage = {
                plantID,
                username,
                message: input.value,
                timestamp: new Date()
            };

            // Check if online, if so, emit message to server via socket
            if (navigator.onLine) {
                socket.emit('chat message', chatMessage);
            } else { // If offline, save message to indexedDB and register a sync event for background synchronization
                const db = await openDB();
                const tx = db.transaction('chats', 'readwrite');
                tx.objectStore('chats').add(chatMessage);
                await tx.done;
                await navigator.serviceWorker.ready.then(registration => {
                    return registration.sync.register('sync-chats');
                });
            }

            input.value = ''; // Clear input field after sending message
        }
    }

    // Add event listener for sending chat message
    sendButton.addEventListener('click', sendChatText);

    // Event listener for receiving chat history
    socket.on('chat history', (msgs) => {
        messages.innerHTML = '';
        msgs.forEach((msg) => {
            const item = document.createElement('li');
            item.textContent = `${formatDate(msg.timestamp)} (${msg.username}) - ${msg.message}`;
            messages.appendChild(item);
        });
        window.scrollTo(0, document.body.scrollHeight); // Scroll to bottom of chat container
    });

    // Event listener for receiving chat message
    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = `${formatDate(msg.timestamp)} (${msg.username}) - ${msg.message}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight); // Scroll to bottom of chat container
    });

    // Join the chat room associated with the plantID
    socket.emit('join room', plantID);
});

// Function to open indexedDB database
async function openDB() {
    return idb.openDB('PlantFindrDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('chats')) {
                db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
            }
        }
    });
}
