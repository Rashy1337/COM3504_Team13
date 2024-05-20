const Chat = require('../models/chat');

exports.init = function(io) {
  io.on('connection', function(socket) {
    socket.on('join room', async function(plantID) {
      socket.join(plantID);
      const messages = await Chat.find({ plantID }).sort('timestamp').exec();
      socket.emit('chat history', messages);
    });

    socket.on('chat message', async function({ plantID, username, message }) {
      const chatMessage = new Chat({ plantID, username, message, timestamp: new Date() });
      await chatMessage.save();
      io.to(plantID).emit('chat message', chatMessage);
    });

    socket.on('sync chat', async function(chat) {
      const chatMessage = new Chat(chat);
      await chatMessage.save();
      io.to(chat.plantID).emit('chat message', chatMessage);
    });

    socket.on('disconnect', async () => {
      // Handle any cleanup or disconnection logic here
    });
  });
};
