const e = require("express");
const Patient = require("../models/patientModel");
const User = require("../models/userModel");

module.exports.addPatientDetails = async (req, res) => {
    try {
        const { id } = req.user;
        const { medicalRecords, allergies, emergencyContact, insuranceDetails } = req.body;

        const userExists = await User.findById(id);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const patient = new Patient({
            userId: id,
            userName: req.user.name,
            medicalRecords,
            allergies,
            emergencyContact,
            insuranceDetails,
        });

        await patient.save();
        res.status(201).json({
            success: true,
            message: "Details for patient added successfully",
            patient
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}