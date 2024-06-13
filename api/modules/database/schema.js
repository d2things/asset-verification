const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const DataSchema = new Schema({
    username: String,
    userId: String,
    profile_picture: String,
    wallet: String,
    dateConnected: {
        type: Date, 
        required: true,
    },
});

module.exports = mongoose.model('ConnectedUsers2', DataSchema);