const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    userName: {
        type: String,
    },
    medicalRecords: [{
        recordType: String, // e.g., "Prescription", "Lab Report"
        description: String,
        recordDate: Date,
        documentUrl: String // URL for accessing record files
    }],
    allergies: [{
        type: String
    }],
    emergencyContact: {
        name: { type: String },
        phoneNo: { type: String },
        relationship: { type: String }
    },
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        coverageAmount: Number
    }
})

const patientModel = mongoose.model('patientModel', patientSchema);

module.exports = patientModel;