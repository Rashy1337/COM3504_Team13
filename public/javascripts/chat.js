document.addEventListener("DOMContentLoaded", (event) => {
    const socket = io();

    const input = document.getElementById('chat_input');
    const messages = document.getElementById('chat-messages');
    const sendButton = document.querySelector('.chat-input button');

    function sendChatText() {
        if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    }

    sendButton.addEventListener('click', sendChatText);

    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
});
