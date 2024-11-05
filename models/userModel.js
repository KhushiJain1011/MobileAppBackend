const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        // required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        // required: true,
    },
    role: {
        type: String,
        enum: ['Patient', 'Doctor'],
        // required: true,
        default: 'Patient'
    },
    phoneNo: {
        type: String,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    profileImg: {
        key: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    birthDate: {
        type: Date,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isNewUser: {
        type: Boolean,
        default: true,
    }
})

const userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;