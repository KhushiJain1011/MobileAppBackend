const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    userRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },

})

const patientModel = mongoose.model('patientModel', patientSchema);

module.exports = patientModel;