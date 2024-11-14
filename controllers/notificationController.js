const Notification = require("../models/notificationModel");
const admin = require("firebase-admin");

module.exports.createNotification = async (req, res) => {
    try {
        const { patientId, doctorId, title, message, notificationType, fcmToken } = req.body;

        const newNotification = new Notification({
            patientId,
            doctorId,
            title,
            message,
            notificationType,
            fcmToken
        })

        await newNotification.save();

        return res.status(201).json({
            success: true,
            message: "Notification created",
            newNotification
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get all notifications of specific patient: 
module.exports.getPatientNotifications = async (req, res) => {
    try {
        const { patientId } = req.params;

        const notifications = await Notification.find({ patientId });
        if (notifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No notifications found for you!!",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Notifications found!!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Doctor's notifications: 
module.exports.getDoctorNotifications = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const notifications = await Notification.find({ doctorId });

        if (notifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No notifications found for you!!",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Notifications found!!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: 'read', readAt: Date.now() },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: "Marked as read!!",
            notification
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// // Archive a notification
// exports.archiveNotification = async (req, res) => {
//     try {
//         const { notificationId } = req.params;

//         const notification = await Notification.findByIdAndUpdate(
//             notificationId,
//             { status: 'archived' },
//             { new: true }
//         );

//         if (!notification) {
//             return res.status(404).json({ success: false, message: 'Notification not found' });
//         }

//         res.status(200).json({ success: true, notification });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Delete a notification: 
module.exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "No notification found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}