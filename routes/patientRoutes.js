const express = require("express");
const { addPatientDetails } = require("../controllers/patientController");
const authenticate = require("../middlewares/authentication");
const router = express.Router();

router.post("/addPatientDetails", authenticate, addPatientDetails);

module.exports = router;