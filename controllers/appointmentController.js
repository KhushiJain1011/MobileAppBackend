const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Appointment = require("../models/appointmentModel");
const cron = require("node-cron")
const sendNotification = require(".././helper/generate")
const moment = require('moment-timezone');
const Notification = require("../models/notificationModel");

// module.exports.scheduleAppointment = async (req, res) => {
//     try {
//         // accessing user id from the token of user logged in: 
//         const userId = req.user._id;
//         console.log("user id: ", userId);
//         // finding record of the patient on basis of user id: 

//         const patientRecord = await Patient.findById(userId); // Adjust this to match your schema
//         if (!patientRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Patient not found",
//             });
//         }
//         // console.log("patient id: ", patientRecord._id);

//         const { doctor } = req.params;
//         const { date, time, status, remindMeBefore } = req.body;

//         const ifDoctorExist = await Doctor.findById(doctor);
//         if (!ifDoctorExist) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Doctor not found",
//             })
//         }

//         // Validate and format the time
//         const formattedTime = formatTime(time);
//         if (!formattedTime) {
//             return res.status(400).json({ success: false, message: "Invalid time format. Please use 'HH:MM AM/PM' or 'HH:MM'." });
//         }

//         // // Create a new Date object from the provided date
//         // const appointmentDateTime = new Date(`${date}T${formattedTime}`);
//         // Create a new Date object from the provided date and convert it to UTC
//         const appointmentDateTime = moment.tz(`${date} ${formattedTime}`, 'Asia/Kolkata').toDate();

//         // Get the current date and set the time to 00:00:00 for accurate comparison
//         const currentDate = new Date();
//         currentDate.setHours(0, 0, 0, 0); // Reset time to the start of the day

//         // console.log("current date: ", currentDate);
//         if (appointmentDateTime <= currentDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Appointments can't be scheduled for past dates"
//             })
//         }

//         const appointment = new Appointment({
//             patient: patientRecord._id,
//             doctor: doctor,
//             date,
//             time: formattedTime,
//             status,
//             remindMeBefore
//         })
//         await appointment.save();

//         // Calculate the reminder time: 
//         // Parse the remindMeBefore value
//         const remindMeBeforeMinutes = parseInt(remindMeBefore.split(' ')[0]);
//         const reminderTime = moment(appointmentDateTime).subtract(remindMeBeforeMinutes, 'minutes').toDate();
//         console.log("reminder time: ", reminderTime);
//         // console.log("reminder time: ", reminderTime);

//         // schedule the notification using node-cron: 
//         const cronTime = `${reminderTime.getUTCMinutes()} ${reminderTime.getUTCHours()} ${reminderTime.getUTCDate()} ${reminderTime.getUTCMonth() + 1} *`
//         cron.schedule(cronTime, async () => {
//             // fetch the patient's FCM token from the db: 
//             const patient = await Patient.findById(patient._id);
//             if (patient && patient.fcmToken) {
//                 const notificationMessage = `You have an appointment scheduled on ${moment(appointmentDateTime).tz('Asia/Kolkata').format('YYYY-MM-DD')} at ${moment(appointmentDateTime).tz('Asia/Kolkata').format('hh:mm A')}`;

//                 // Call the modified sendNotification function
//                 await sendNotification(patient.fcmToken, "Appointment Reminder", notificationMessage, appointment);

//             }
//         })
//         return res.status(201).json({
//             success: true,
//             message: "Appointment scheduled successfully",
//             appointment
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

module.exports.scheduleAppointment = async (req, res) => {
    try {
        const patientId = req.user._id;
        console.log("user id: ", patientId);
        const doctorId = req.params.doctorId;
        const { date, time, remindMeBefore } = req.body;

        // Validate input
        if (!patientId || !doctorId || !date || !time || !remindMeBefore) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Combine date and time into a single moment object in IST
        const appointmentDateTime = moment.tz(`${date} ${time}`, 'Asia/Kolkata');

        // Check if the appointment time is in the future
        if (appointmentDateTime.isBefore(moment())) {
            return res.status(400).json({ success: false, message: "Appointment must be scheduled in the future." });
        }

        // Create the appointment
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            date: appointmentDateTime.toDate(),
            time: time,
            remindMeBefore,
        });
        await appointment.save();

        // Calculate the notification time
        const notifyTime = appointmentDateTime.clone().subtract(parseInt(remindMeBefore, 10), 'minutes');
        console.log("notify time: ", notifyTime)
        // Schedule the notification using cron
        const cronTime = `${notifyTime.minutes()} ${notifyTime.hours()} ${notifyTime.date()} ${notifyTime.month() + 1} *`;
        console.log("cron time: ", cronTime);
        cron.schedule(cronTime, async () => {
            const patient = await Patient.findById(patientId);
            console.log("patient: ", patient);
            console.log("patient fcm token: ", patient.fcmToken)
            if (patient && patient.fcmToken) {
                console.log("data fetched !!!!!!")
                const notificationMessage = `Reminder: You have an appointment scheduled on ${appointmentDateTime.format('YYYY-MM-DD')} at ${time}.`;

                // Create a notification record in the database
                const notification = new Notification({
                    patientId,
                    doctorId,
                    title: "Appointment Reminder",
                    message: notificationMessage,
                    notificationType: 'reminder',
                    fcmToken: patient.fcmToken,
                });
                await notification.save();

                console.log("notification saved ---------- ")
                // Send the notification (implement your notification sending logic here)
                const ifNotified = await sendNotification(patient.fcmToken, "Appointment Reminder", notificationMessage);
                console.log("if notified: ", ifNotified);
                if (ifNotified) {
                    console.log("notification sent!!")
                } else {
                    console.log("error in sending notification")
                }
            }
        });

        return res.status(201).json({ success: true, message: "Appointment scheduled successfully", appointment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Function to validate and format time
function formatTime(time) {
    // Check if time is in 12-hour format
    const regex12Hour = /^(0?[1-9]|1[0-2]):([0-5][0-9]) ?([AP]M)$/i;
    const regex24Hour = /^(2[0-3]|[01]?[0-9]):([0-5][0-9])$/;

    if (regex12Hour.test(time)) {
        // Convert 12-hour format to 24-hour format
        const date = new Date(`1970-01-01T${time}`);
        return date.toTimeString().split(' ')[0]; // Returns in HH:MM:SS format
    } else if (regex24Hour.test(time)) {
        return time; // Valid 24-hour format
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