// notificationScheduler.js
const cron = require("node-cron");
const Notification = require("../models/notificationModel");
const { sendNotification } = require("../helper/handleNotifications");

// Schedule reminders every minute (adjust interval as needed)
const scheduleReminderNotifications = () => {
    cron.schedule("* * * * *", async () => {
        const now = new Date(); // Get the current time at the start of each cron job execution

        const notifications = await Notification.find({
            notificationType: "reminder",
            status: "pending", // Only fetch unsent reminders
            remindAt: { $lte: now }, // Reminder time is less than or equal to current time
        });

        notifications.forEach(async (notification) => {
            const { patientId, title, message, fcmToken } = notification;

            // Send FCM Notification
            await sendNotification(fcmToken, title, message);

            // Mark as sent to avoid re-sending
            await Notification.findByIdAndUpdate(notification._id, { status: "sent" });
        });
    });
};

module.exports = {
    scheduleReminderNotifications,
};