const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/plants';
let connection;

mongoose.Promise = global.Promise;

/**
 * Connect to the database
 */
mongoose.connect(mongoDB).then(result => {

connection = result.connection;

console.log(`Connected to ${mongoDB}`);
}).catch(err => {

console.log(`Error connecting to ${mongoDB}: ${err}`);

})