const express = require("express");
const authenticate = require("../middlewares/authentication");
const { scheduleAppointment, getMyAppointments } = require("../controllers/appointmentController");
const router = express.Router();

// Schedule an appointment: 
router.post("/scheduleAppointment", authenticate, scheduleAppointment);

// Get my appointments: 
router.get("/getMyAppointments", authenticate, getMyAppointments);

module.exports = router;