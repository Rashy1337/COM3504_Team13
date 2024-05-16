const Chat = require('../models/chat'); // Assuming you have a Chat model

exports.init = function(io) {
  io.on('connection', function(socket) {
      socket.on('chat message', async function(msg) {
          // Save message to database
          const chatMessage = new Chat({ message: msg, timestamp: new Date() });
          await chatMessage.save();

          // Emit the message to all connected clients
          io.emit('chat message', msg);
      });
  });
}
