const Chat = require('../models/chat');

exports.init = function(io) {
  io.on('connection', function(socket) {
    socket.on('join room', async function(plantID) {
      socket.join(plantID);
      const messages = await Chat.find({ plantID }).sort('timestamp').exec();
      socket.emit('chat history', messages);
    });

    socket.on('chat message', async function({ plantID, msg }) {
      const chatMessage = new Chat({ plantID, message: msg, timestamp: new Date() });
      await chatMessage.save();
      io.to(plantID).emit('chat message', chatMessage);
    });
  });
}
