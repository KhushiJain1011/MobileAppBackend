const express = require("express");
const { addPatientDetails, register, login, verifyOTP, sendVerifyEmailLink, verifyEmail } = require("../controllers/patientController");
const { validate } = require("../middlewares/validate");
const { registerValidator, loginValidator } = require("../validator/userValidator");
const authenticate = require("../middlewares/authentication");
const router = express.Router();

// user register: 
router.post("/register/:userId", validate(registerValidator), register);

// user login: 
router.post("/login", validate(loginValidator), login);

// verify otp: 
router.post("/verifyOTP/:userId", verifyOTP);

// send verify email link:
router.post("/sendVerifyEmailLink/:userId", sendVerifyEmailLink);

// verify email: 
router.get("/verifyEmail/:token", verifyEmail);

// router.post("/addPatientDetails", authenticate, addPatientDetails);


module.exports = router;