const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'userModel',
    //     required: true,
    // },
    doctorName: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    city: {
        type: String
    },
    consultationFee: {
        type: Number,
    },
    experience: {
        type: Number,
        required: true,
    },
    qualificationOne: {
        // degrees or certificates
        type: String,
        required: true,
    },
    qualificationTwo: {
        // degrees or certificates
        type: String,
        // required: true,
    },
    specializationOne: {
        type: String,
        required: true,
    },
    specializationTwo: {
        type: String,
        required: true,
    },
    availableHours: {
        type: Array,
        // required: true,
    },
    serviceOne: {
        type: String
    },
    serviceTwo: {
        type: String
    },
    serviceThree: {
        type: String
    },
    ratings: {
        type: Number,
        default: 0,
    },
    liveStatus: {
        type: Boolean,
        default: false
    }, // Indicates if the doctor is currently live streaming
})


const doctorModel = mongoose.model('doctorModel', doctorSchema);

module.exports = doctorModel;