document.addEventListener("DOMContentLoaded", (event) => {
    const socket = io();
    const plantID = document.getElementById('plantID').value;

    const input = document.getElementById('chat_input');
    const messages = document.getElementById('chat-messages');
    const sendButton = document.querySelector('.chat-input button');

    function formatDate(date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    }

    function sendChatText() {
        if (input.value) {
            socket.emit('chat message', { plantID, msg: input.value });
            input.value = '';
        }
    }

    sendButton.addEventListener('click', sendChatText);

    socket.on('chat history', (msgs) => {
        messages.innerHTML = '';
        msgs.forEach((msg) => {
            const item = document.createElement('li');
            item.textContent = `${formatDate(msg.timestamp)} - ${msg.message}`;
            messages.appendChild(item);
        });
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = `${formatDate(msg.timestamp)} - ${msg.message}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.emit('join room', plantID);
});
