const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    experience: {
        type: Number,
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
    services: [{ type: String }],       // Array of services like "General Consultation", "Surgery"
    ratings: {
        type: Number,
        default: 0,
    },
    liveStatus: {
        type: Boolean,
        default: false
    }, // Indicates if the doctor is currently live streaming
    certifications: [{
        name: String,
        institution: String,
        year: Number
    }],
})


const doctorModel = mongoose.model('doctorModel', doctorSchema);

module.exports = doctorModel;