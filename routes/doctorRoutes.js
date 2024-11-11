const express = require("express");
const { addDoctorDetails, doctorProfile, searchDoctor, searchDoctorByCategory, filterDoctors } = require("../controllers/doctorController");
const authenticate = require("../middlewares/authentication");
const router = express.Router();

// Add Doctor details: 
router.post("/addDoctorDetails", authenticate, addDoctorDetails);

// Get the profile of a doctor: 
router.get("/doctorProfile/:doctorId", authenticate, doctorProfile);

// Search doctors
router.post("/searchDoctor", authenticate, searchDoctor);

// Search doctors by category: 
router.post("/searchDoctorByCategory", authenticate, searchDoctorByCategory);

// Filter Doctors: 
router.post("/filterDoctors", authenticate, filterDoctors);

module.exports = router;