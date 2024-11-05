const express = require("express");
const { login, register, verifyOTP, sendVerifyEmailLink, uploadProfilePic, verifyEmail } = require("../controllers/userController");
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
router.post("/verifyEmail/:token", verifyEmail);

// upload (or edit) profile image: 
router.post("/uploadProfilePicture", authenticate, uploadProfilePic);

module.exports = router;