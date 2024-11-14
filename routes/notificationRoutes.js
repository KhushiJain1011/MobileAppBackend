const admin = require('firebase-admin');
const express = require('express');
// const bodyParser = require('body-parser');

const serviceAccount = require('../firebase/serviceAccount.json');  // Path to your service account JSON file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


const router = express.Router();

router.post("/sendNotifications", async (req, res) => {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
        // console.log("Missing token, title, or body")
        return res.status(400).send({ error: 'Missing token, title, or body' });
    }

    // console.log("token, title, body: ", token, title, body)
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            token: token,      // FCM TOKEN
            android: {
                priority: 'high',  // Ensure high priority for immediate delivery on Android
                ttl: 3600 * 1000,  // Optional: Set a TTL (1 hour here) for how long FCM will keep the message if the device is offline
            },
        }
        const response = await admin.messaging().send(message);
        // console.log("notification sent successfully: ", response);

        return res.status(200).json({
            success: true,
            message: "Notification sent",
        })
    } catch (error) {
        console.error('Error sending notification:', error.message);
        res.status(500).send({ error: error.message || 'Failed to send notification' });
    }
})

router.post("/saveToken", (req, res) => {
    const { token } = req.body;
    // console.log("Recieved token: ", token);
    return res.status(200).send({ success: true });
})


module.exports = router;