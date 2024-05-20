const mongoose = require('mongoose');

// Define the schema for chat messages
const chatSchema = new mongoose.Schema({
    plantID: String,        // ID of the plant associated with the chat
    username: String,       // Username of the sender
    message: String,        // Content of the chat message
    timestamp: {            // Timestamp indicating when the message was sent
        type: Date,
        default: Date.now   // Default value is the current timestamp
    }
});

// Export the Mongoose model named 'Chat' using the defined schema
module.exports = mongoose.model('Chat', chatSchema);
