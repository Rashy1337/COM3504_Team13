const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/plant';
let connection;

mongoose.Promise = global.Promise;

/**
 * Connect to the database
 */
mongoose.connect(mongoDB).then(result => {

connection = result.connection;

    console.log("Connection Successful!");
}).catch(err => {
    // Log an error message if the connection fails
    console.log("Connection Failed!", err);
})