const e = require("express");
const Patient = require("../models/patientModel");
const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const { generateToken, generateOTP, generateEmailVerificationToken } = require("../helper/generate");
const Token = require("../models/tokenModel");
const { sendVerificationMail } = require("../helper/sendEmail");

// USER REGISTRATION:
module.exports.register = async (req, res) => {
    try {
        const { userId } = req.params;
        // getting user details: 
        const { name, email, gender, birthDate, city, emergencyContactName, emergencyContactPhone, emergencyContactRelation } = req.body;

        // if required details are not provided: 
        if (!name || !email || !gender || !city || !birthDate) {
            return res.status(400).json({
                success: false,
                message: "Provide required details"
            })
        }

        // creating record for user(patient): 
        const patient = await Patient.findById(userId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            })
        }

        // UPDATE USER DETAILS: 
        patient.name = name;
        patient.email = email;
        patient.gender = gender;
        patient.birthDate = birthDate;
        patient.city = city;
        patient.isNewUser = false;

        await patient.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully!!",
            patient
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
        console.log("phone no: ", phoneNo);

        // if phone number is not provided: 
        if (!phoneNo) {
            return res.status(400).json({
                success: false,
                message: "Provide Phone Number"
            })
        }

        // finding user with phone no: 
        let patient = await Patient.findOne({ phoneNo });

        // if user is not found: 
        if (!patient) {
            const newPatient = new Patient({ phoneNo });
            await newPatient.save();

            // Assign the newly created patient to the `patient` variable
            patient = newPatient;

            console.log("New patient created:", newPatient);
        }

        // if user is found, generating OTP for user: 
        const providedOTP = await generateOTP();
        console.log("Provided otp code: ", providedOTP);

        // console.log("patient._id: ", patient.id);
        // if previously any otp for the user exists, removing from DB: 
        await OTP.deleteMany({ userId: patient._id })

        // creating new record for generated otp for verification: 
        const otpDoc = new OTP({
            userId: patient._id,
            otpCode: providedOTP
        })
        // saving the otp:
        await otpDoc.save();
        // console.log("OTP DOC: ", otpDoc);

        // Sending sms to registered number for OTP: 
        // sendSMS(phoneNo, `${providedOTP} is your OTP for accessing your account. The OTP is valid for 5 minutes.`);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your phone number successfully!!",
            userId: patient._id,
            isNewUser: patient.isNewUser,
            otpDoc,
            // newPatient
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
        const patient = await Patient.findById(userId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            })
        }

        // if correct otp is entered, it should be deleted from DB: 
        await OTP.deleteOne({ userId });

        const accessToken = await generateToken(patient);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            accessToken,
            isNewUser: patient.isNewUser
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

        const patient = await Patient.findById(userId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Delete any existing tokens for the user
        await Token.deleteMany({ userId: patient._id });

        const verificationToken = await generateEmailVerificationToken();
        // console.log("ver token: ", verificationToken);

        const token = new Token({
            userId: patient._id,
            token: verificationToken,
        })
        await token.save();

        const verificationLink = `http://localhost:3000/api/patient/verifyEmail/${verificationToken}`;

        // Render the EJS template
        // const templatePath = path.join(__dirname, '../views', 'emailVerification.ejs');
        // const emailBody = await ejs.render(fs.readFileSync(templatePath, 'utf-8'), {
        //     verificationLink: verificationLink
        // });

        const temp = `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f4;
                }

                .container {
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    color: #333;
                }

                p {
                    font-size: 16px;
                    color: #555;
                }

                .button {
                    display: inline-block;
                    padding: 15px 30px;
                    font-size: 16px;
                    color: white;
                    background-color: #4CAF50; /* Green */
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }

                .button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <h1>Email Verification</h1>
                <p>Hello,</p>
                <p>Your link for email verification is this: </p>
                <a href="${verificationLink}" class="button">Verify Email</a>
                <p> This is valid for 5 minutes.</p>
                <p>If you did not request this email, please ignore it.</p>

            </div>
        </body>

    </html>
`

        // // Generate the email body
        // const emailBody = await emailVerification(verificationLink); // Await the result

        await sendVerificationMail(
            email,
            "Email verification",
            // `Hello. Your link for email verification is: ${verificationLink}`,
            // emailBody
            temp
        );

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


// VERIFY EMAIL: 
module.exports.verifyEmail = async (req, res) => {
    console.log('Received verification request with token:', req.params.token); // Log the received token

    try {
        const { token } = req.params;

        const verificationToken = await Token.findOne({ token });

        console.log("token: ", verificationToken);

        if (!verificationToken) {
            console.log("no verification token found ")
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            })
        }

        // console.log("user id: ", verificationToken.userId)
        const patient = await Patient.findById(verificationToken.userId);
        if (!patient) {
            console.log("no user found")
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        patient.isEmailVerified = true;
        console.log("email verified: ", patient.isEmailVerified);
        await patient.save();

        await Token.deleteOne({ _id: verificationToken._id });

        // Redirect to a success page
        // return res.redirect('http://localhost:3000/verificationSuccess.html'); // Change this to your actual success URL

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!!",
            redirectUrl: '/verificationSuccess.html'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
        // return res.redirect('http://localhost:3000/api/user/verificationFailure.html'); // Change this to your actual success URL

    }
}



// module.exports.addPatientDetails = async (req, res) => {
//     try {
//         const { id } = req.user;
//         const { medicalRecords, allergies, emergencyContact, insuranceDetails } = req.body;

//         const userExists = await User.findById(id);
//         if (!userExists) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             })
//         }

//         const patient = new Patient({
//             userId: id,
//             userName: req.user.name,
//             medicalRecords,
//             allergies,
//             emergencyContact,
//             insuranceDetails,
//         });

//         await patient.save();
//         res.status(201).json({
//             success: true,
//             message: "Details for patient added successfully",
//             patient
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }