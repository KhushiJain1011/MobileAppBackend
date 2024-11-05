
const { sendSMS, generateOTP, generateToken, generateEmailVerificationToken } = require("../helper/generate");
const User = require("../models/userModel")
const OTP = require("../models/otpModel");
const Token = require("../models/tokenModel");
const { sendVerificationMail } = require("../helper/sendEmail");
const multer = require("multer");
const { upload } = require("../middlewares/multer");

require("dotenv").config();

// USER REGISTRATION:
module.exports.register = async (req, res) => {
    try {
        const { userId } = req.params;
        // getting user details: 
        const { name, email, gender, birthDate, city } = req.body;

        // if required details are not provided: 
        if (!name || !email || !gender || !city || !birthDate) {
            return res.status(400).json({
                success: false,
                message: "Provide required details"
            })
        }

        // creating record for user(patient): 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // UPDATE USER DETAILS: 
        user.name = name;
        user.email = email;
        user.gender = gender;
        user.birthDate = birthDate;
        user.city = city;

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Registered successfully!!",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// USER LOGIN WITH PHONE NUMBER:
module.exports.login = async (req, res) => {
    try {
        // getting user's phone no: 
        const { phoneNo } = req.body;

        // if phone number is not provided: 
        if (!phoneNo) {
            return res.status(400).json({
                success: false,
                message: "Provide Phone Number"
            })
        }

        // finding user with phone no: 
        let user = await User.findOne({ phoneNo });

        // if user is not found: 
        if (!user) {
            user = new User({ phoneNo });
            await user.save();

            console.log("New user created:", user);
        }

        // if user is found, generating OTP for user: 
        const providedOTP = await generateOTP();
        console.log("Provided otp code: ", providedOTP);

        // if previously any otp for the user exists, removing from DB: 
        await OTP.deleteMany({ userId: user._id })

        // creating new record for generated otp for verification: 
        const otpDoc = new OTP({
            userId: user._id,
            otpCode: providedOTP
        })
        // saving the otp:
        await otpDoc.save();
        // console.log("OTP DOC: ", otpDoc);

        // Sending sms to registered number for OTP: 
        // sendSMS(phoneNo, `${providedOTP} is your OTP for accessing your account. The OTP is valid for 5 minutes.`);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your phone number successfully",
            userId: user._id,
            otpDoc
        })
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// OTP VERIFICATION:
module.exports.verifyOTP = async (req, res) => {
    try {
        // providing user's userId: 
        const { userId } = req.params;

        // if user id is not provided: 
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User id is required"
            });
        }

        // getting otp entered by user: 
        const { otp } = req.body;

        // if otp is not entered: 
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Provide OTP",
            });
        }

        // getting the otp associated with user from db for verification: 
        const userDbOTP = await OTP.findOne({ userId });

        // if otp is not found in the db: 
        if (!userDbOTP) {
            return res.status(410).json({
                success: false,
                message: "OTP expired"
            })
        }

        // if the generated otp and otp entered by user is not same:  
        if (userDbOTP.otpCode != otp) {
            return res.status(401).json({
                success: false,
                message: "Incorrect OTP",
            })
        }

        // if otp matches, finding user:
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // if correct otp is entered, it should be deleted from DB: 
        await OTP.deleteOne({ userId });

        const accessToken = await generateToken(user);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            accessToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// SEND LINK TO VERIFY EMAIL ADDRESS: 
module.exports.sendVerifyEmailLink = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const verificationToken = await generateEmailVerificationToken();
        // console.log("ver token: ", verificationToken);

        const token = new Token({
            userId: user.id,
            token: verificationToken,
        })
        await token.save();

        const verificationLink = `http://localhost:6000/api/user/verifyEmail/${verificationToken}`;
        sendVerificationMail(email, "Email verification", `Hello. Your link for email verification is: ${verificationLink}`);

        // sendVerificationMail(email, "verification mail", "sample test message");
        return res.status(200).json({
            success: true,
            message: "Email for verification sent",

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const verificationToken = await Token.findOne({ token });

        // console.log("token: ", verificationToken);

        if (!verificationToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            })
        }

        // console.log("user id: ", verificationToken.userId)
        const user = await User.findById(verificationToken.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.isEmailVerified = true;
        await user.save();

        await Token.deleteOne({ _id: verificationToken._id });

        return res.status(500).json({
            success: true,
            message: "Email verified successfully!!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// UPLOAD (ADD OR EDIT) PROFILE IMAGE: 
module.exports.uploadProfilePic = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File size too large.. Maximum size is 1MB only."
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: "Error uploading image",
                error: err
            })
        }
        try {
            const { id } = req.user;

            // const { userId } = req.params
            // console.log("user id: ", userId);

            // const user = await User.findById(userId);
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File not provided"
                })
            }

            user.profileImg = {
                key: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
            await user.save();

            // console.log("user profile image: ", user.profileImg);

            return res.status(200).json({
                success: true,
                message: "Profile image uploaded.."
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    })
}