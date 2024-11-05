const express = require("express");
const { addDoctorDetails, doctorProfile } = require("../controllers/doctorController");
const authenticate = require("../middlewares/authentication");
const router = express.Router();

router.post("/addDoctorDetails", authenticate, addDoctorDetails);
router.get("/doctorProfile/:doctorId", authenticate, doctorProfile);

module.exports = router;