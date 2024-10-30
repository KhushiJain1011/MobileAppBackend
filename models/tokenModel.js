const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    token: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 300
    }
})

const tokenModel = mongoose.model('tokenModel', tokenSchema);
module.exports = tokenModel;