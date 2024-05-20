const Chat = require('../models/chat');

// Function to initialize chat functionality
exports.init = function(io) {
  // Event listener for when a client connects
  io.on('connection', function(socket) {
    // Event listener for when a client joins a room
    socket.on('join room', async function(plantID) {
      // Join the specified room
      socket.join(plantID);
      // Fetch chat history for the specified plantID and send it to the client
      const messages = await Chat.find({ plantID }).sort('timestamp').exec();
      socket.emit('chat history', messages);
    });

    // Event listener for when a client sends a chat message
    socket.on('chat message', async function({ plantID, username, message }) {
      // Create a new chat message object and save it to the database
      const chatMessage = new Chat({ plantID, username, message, timestamp: new Date() });
      await chatMessage.save();
      // Broadcast the chat message to all clients in the room
      io.to(plantID).emit('chat message', chatMessage);
    });

    // Event listener for when a client wants to sync a chat message
    socket.on('sync chat', async function(chat) {
      // Create a new chat message object from the provided data and save it to the database
      const chatMessage = new Chat(chat);
      await chatMessage.save();
      // Broadcast the chat message to all clients in the room
      io.to(chat.plantID).emit('chat message', chatMessage);
    });

    // Event listener for when a client disconnects
    socket.on('disconnect', async () => {
      // Handle any cleanup or disconnection logic here if needed
    });
  });
};
