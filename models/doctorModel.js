const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    qualifications: {
        // degrees or certificates
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    availableHours: {
        type: Array,
        // required: true,
    },
    services: [{ type: String }],
    ratings: {
        type: Number,
        default: 0,
    }
})


const doctorModel = mongoose.model('doctorModel', doctorSchema);

module.exports = doctorModel;