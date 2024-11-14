const mongoose = require('mongoose');
const Wallet = require("../models/walletModel")

const patientSchema = mongoose.Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'userModel',
    //     required: true,
    // },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phoneNo: {
        type: String,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    profileImage: {
        key: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    preProvidedImages: [
        {
            key: { type: String },   // Optional key (could be used for cloud storage if needed)
            url: { type: String }    // URL of the pre-provided image
        }
    ],
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
    },
    fcmToken: {
        type: String,  // Store the FCM token as a string
        default: null, // Default value can be null
    },
    emergencyContactName: {
        type: String,
    },
    emergencyContactPhone: {
        type: String,
    },
    emergencyContactRelation: {
        type: String,
    },
})

// After saving a new user, automatically create their wallet with default values: 
patientSchema.post('save', async function (doc, next) {
    try {
        // create a new wallet for the user: 
        const newWallet = new Wallet({
            userId: doc._id,
            balance: 0,
            transactionHistory: []
        });

        // save the wallet: 
        await newWallet.save();
        next();
    } catch (error) {
        next(error)
    }
})

const patientModel = mongoose.model('patientModel', patientSchema);

module.exports = patientModel;






// const mongoose = require('mongoose');

// const patientSchema = mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'userModel',
//         required: true,
//     },
//     userName: {
//         type: String,
//     },
//     medicalRecords: [{
//         recordType: String, // e.g., "Prescription", "Lab Report"
//         description: String,
//         recordDate: Date,
//         documentUrl: String // URL for accessing record files
//     }],
//     allergies: [{
//         type: String
//     }],
//     emergencyContact: {
//         name: { type: String },
//         phoneNo: { type: String },
//         relationship: { type: String }
//     },
//     insuranceDetails: {
//         provider: String,
//         policyNumber: String,
//         coverageAmount: Number
//     }
// })

// const patientModel = mongoose.model('patientModel', patientSchema);

// module.exports = patientModel;