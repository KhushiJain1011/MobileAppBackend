const express = require("express");
const { login, register, verifyOTP, sendVerifyEmailLink, uploadProfilePic } = require("../controllers/userController");
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

// verify email:
router.post("/sendVerifyEmailLink", sendVerifyEmailLink);

// upload (or edit) profile image: 
router.post("/uploadProfilePicture", authenticate, uploadProfilePic);

module.exports = router;