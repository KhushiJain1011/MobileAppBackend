const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Appointment = require("../models/appointmentModel");

module.exports.scheduleAppointment = async (req, res) => {
    try {
        // const { _id: patientId } = req.user;
        // accessing user id from the token of user logged in: 
        const userId = req.user._id;

        // finding record of the patient on basis of user id: 
        const patientRecord = await Patient.findOne({ userId: userId }); // Adjust this to match your schema
        if (!patientRecord) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        // console.log("patient id: ", patientRecord._id);

        const { doctor, date, time } = req.body;

        // const ifPatientExist = await Patient.findById(patientId);
        // if (!ifPatientExist) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "Patient not found",
        //     })
        // }

        const ifDoctorExist = await Doctor.findById(doctor);
        if (!ifDoctorExist) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            })
        }

        // Create a new Date object from the provided date
        const appointmentDate = new Date(date);
        // Get the current date and set the time to 00:00:00 for accurate comparison
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to the start of the day

        // console.log("current date: ", currentDate);
        if (appointmentDate <= currentDate) {
            return res.status(400).json({
                success: false,
                message: "Appointments can't be scheduled for past dates"
            })
        }

        const appointment = new Appointment({
            patient: patientRecord._id,
            doctor: doctor,
            date,
            time
        })
        await appointment.save();

        return res.status(201).json({
            success: true,
            message: "Appointment scheduled successfully",
            appointment
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Get List of a Patient's appointments: 
module.exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        // console.log("user id: ", userId);

        const patientRecord = await Patient.findOne({ userId: userId });
        if (!patientRecord) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        const appointments = await Appointment.find({ patient: patientRecord._id });
        if (!appointments) {
            return res.status(404).json({
                success: false,
                message: "No appointments found!!",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Appointments fetched!!",
            appointments
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}