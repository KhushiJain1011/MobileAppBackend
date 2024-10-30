const { body } = require("express-validator");
const User = require("../models/userModel");

// register validations: 
module.exports.registerValidator = [
    body("email")
        .notEmpty().withMessage("Please enter an email")
        .isEmail().withMessage("Please enter a valid email")
        .custom(async (value) => {
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Error("User with this email already exists.. Try another one!!")
            }
        }),
]

module.exports.loginValidator = [
    body("phoneNo")
        .notEmpty().withMessage("Please enter phone number")
        .isLength({ min: 10, max: 10 }).withMessage("Phone number must contain 10 digits")
    // .custom(async (value) => {
    //     const existingUser = await User.findOne({ phoneNo: value });
    //     if (existingUser) {
    //         throw new Error("User with this phone number already exists..")
    //     }
    // }),
]