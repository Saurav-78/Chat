const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    name:String, message:String, 
    createdAt:{
        type:Date,
        default:Date.now,
        },
        
});

module.exports = mongoose.model('message', messageSchema);