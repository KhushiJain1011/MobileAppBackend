const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Appointment = require("../models/appointmentModel");
const cron = require("node-cron")
const moment = require('moment-timezone');
const Notification = require("../models/notificationModel");
const admin = require("firebase-admin")
const { sendNotification } = require("../helper/handleNotifications");


// Schedule a patient's appointment: 
module.exports.scheduleAppointment = async (req, res) => {
    try {
        // getting patient's id: (from login):
        const patientId = req.user._id;

        // getting doctor's id:
        const doctorId = req.params.doctorId;

        // finding doctor: 
        const doctor = await Doctor.findById(doctorId);

        // if no doctor is found: 
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found!!"
            })
        }

        // finding patient and patient's fcm token:
        const patient = await Patient.findById(patientId);
        const fcmToken = patient.fcmToken
        const doctorFCMToken = doctor.fcmToken;

        // getting appointment data:
        const { date, time, status, remindMeBefore } = req.body;

        // creating a new appointment (with status as pending until the doctor confirms): 
        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            date,
            time,
            status: "Pending",
            createdAt: Date.now(),
            remindMeBefore,         // time to notify before appointment (by patient)
        })
        // saving the appointment details: 
        await newAppointment.save();

        const appointmentDate = new Date(`${date}T${time}`);
        const reminderTime = new Date(appointmentDate.getTime() - parseInt(remindMeBefore) * 60000); // remindMeBefore in minutes
        console.log("reminderTime: ", reminderTime);

        // Sending a notification to the doctor: (patient awaiting confirmation)
        const doctorNotification = new Notification({
            // patientId,
            doctorId,
            title: "Appointment Confirmation",
            message: `A new appointment has been requested by ${patient.name} for ${date} at ${time}.`,
            notificationType: "update",    // appointment confirmation
            status: "pending",
            // remindAt: reminderTime, // Store reminder time
            // createdAt: new Date(),
            // fcmToken: fcmToken // Store FCM token for later use
            fcmToken: doctorFCMToken        // as the notification is to be sent to the doctor
        });

        // saving notification for doctor and sending the notification: 
        await doctorNotification.save();
        sendNotification(doctorFCMToken, doctorNotification.title, doctorNotification.message);

        // Create a reminder notification for the patient
        // const patientReminderNotification = new Notification({
        //     patientId: patientId,
        //     doctorId,
        //     title: "Appointment Reminder",
        //     message: `You have an appointment scheduled for ${date} at ${time}.`,
        //     notificationType: "reminder",
        //     status: "pending",
        //     remindAt: reminderTime,
        //     fcmToken: fcmToken
        // });

        // await patientReminderNotification.save();
        return res.status(201).json({
            success: true,
            message: "Appointment created.. Awaiting confirmation",
            newAppointment,
            doctorNotification
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
        const patientId = req.user._id;
        // console.log("user id: ", userId);

        const patientRecord = await Patient.findById(patientId)
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



// // Schedule reminders every minute (adjust interval as needed)
// cron.schedule("* * * * *", async () => {
//     const now = new Date(); // Get the current time at the start of each cron job execution

//     const notifications = await Notification.find({
//         notificationType: "reminder",
//         status: "pending", // Only fetch unsent reminders
//         remindAt: { $lte: now }, // Reminder time is less than or equal to current time
//     });

//     notifications.forEach(async (notification) => {
//         const { patientId, title, message, fcmToken } = notification;

//         // Send FCM Notification
//         await sendNotification(fcmToken, title, message);

//         // Mark as sent to avoid re-sending
//         await Notification.findByIdAndUpdate(notification._id, { status: "sent" });
//     });
// });
