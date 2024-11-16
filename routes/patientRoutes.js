const express = require("express");
const { addPatientDetails, register, login, verifyOTP, sendVerifyEmailLink, verifyEmail, googleLogin, logout, uploadProfilePic, addPreProvidedImage, updateFCMToken, markDoctorFavorite, getFavorites } = require("../controllers/patientController");
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

// Logout:
// router.post("/logout", logout);

// router.post("/addPreProvidedImage", addPreProvidedImage);

// Google login: 
router.post('/google-login', googleLogin);

// Mark A Doctor As Favorite: 
router.post("/markDoctorFavorite/:doctorId", authenticate, markDoctorFavorite);

// Get Favorite Doctors: 
router.get("/getFavorites", authenticate, getFavorites);

// Upload profile picture: 
router.post("/uploadProfilePicture/:userId", uploadProfilePic);

// Update FCM Token: 
router.post("/updateFCMToken", authenticate, updateFCMToken);

// router.post("/addPatientDetails", authenticate, addPatientDetails);


module.exports = router;