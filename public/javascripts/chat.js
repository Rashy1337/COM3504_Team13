document.addEventListener("DOMContentLoaded", (event) => {
    const socket = io();
    const plantID = document.getElementById('plantID').value; // Assume plantID is stored in a hidden input field

    const input = document.getElementById('chat_input');
    const messages = document.getElementById('chat-messages');
    const sendButton = document.querySelector('.chat-input button');

    function sendChatText() {
        if (input.value) {
            socket.emit('chat message', { plantID, msg: input.value });
            input.value = '';
        }
    }

    sendButton.addEventListener('click', sendChatText);

    socket.on('chat history', (msgs) => {
        messages.innerHTML = ''; // Clear existing messages
        msgs.forEach((msg) => {
            const item = document.createElement('li');
            item.textContent = msg.message;
            messages.appendChild(item);
        });
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg.message;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.emit('join room', plantID);
});
