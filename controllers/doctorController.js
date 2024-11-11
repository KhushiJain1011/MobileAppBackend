const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

// ADD DOCTOR's DETAILS: 
module.exports.addDoctorDetails = async (req, res) => {
    try {
        const { id } = req.user;
        console.log("userid: ", id);
        const { experience, qualifications, specialization, availableHours, services, ratings, liveStatus, certifications } = req.body;

        const userExists = await User.findById(id);
        console.log("user exists: ", userExists);
        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const doctor = new Doctor({
            userId: id,
            doctorName: req.user.name,
            experience,
            qualifications,
            specialization,
            availableHours,
            services,
            ratings,
            liveStatus,
            certifications
        });
        await doctor.save();
        res.status(201).json({
            success: true,
            message: "Details for doctor added successfully",
            doctor
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// GET THE PROFILE OF A DOCTOR: 
module.exports.doctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Doctor's profile fetched!!",
            doctor,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// SEARCH A DOCTOR OR SPECIALIST: 
module.exports.searchDoctor = async (req, res) => {
    try {
        const { doctorName, specialization } = req.query;

        const searchQuery = {};
        console.log("search query 1: ", searchQuery);
        if (doctorName) {
            searchQuery['doctorName'] = { $regex: doctorName, $options: 'i' }; // Case-insensitive search for name
        }
        // if (specialization) {
        //     searchQuery['specialization'] = { $regex: specialization, $options: 'i' }; // Case-insensitive search for specialization
        // }
        if (specialization) {
            // Use `$or` to match specialization in either `specializationOne` or `specializationTwo`
            searchQuery['$or'] = [
                { specializationOne: { $regex: specialization, $options: 'i' } },
                { specializationTwo: { $regex: specialization, $options: 'i' } }
            ];
        }

        console.log("search query 2: ", searchQuery);

        const doctors = await Doctor.find(searchQuery);

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No doctors found"
            })
        }
        // console.log("doctors: ", doctors);

        return res.status(200).json({
            success: true,
            message: "Doctors found",
            doctors
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Search doctors by category: 
module.exports.searchDoctorByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        console.log("category: ", category);

        const searchQuery = {};

        // // in case when only one field of specialization is there: 
        // if (category) {
        //     searchQuery['specialization'] = { $regex: specialization, $options: 'i' }; // Case-insensitive search for specialization   
        // }
        if (category) {
            // Use `$or` to match specialization in either `specializationOne` or `specializationTwo`
            searchQuery['$or'] = [
                { specializationOne: { $regex: category, $options: 'i' } },
                { specializationTwo: { $regex: category, $options: 'i' } }
            ];
        }
        const doctors = await Doctor.find(searchQuery);
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No doctors found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Doctors fetched according to category",
            doctors
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Filter doctors: 
module.exports.filterDoctors = async (req, res) => {
    try {
        const { specialization, location, minPrice, maxPrice, gender } = req.query;

        const filterQuery = {};

        console.log("filter query 1: ", filterQuery);
        if (specialization) {
            filterQuery['$or'] = [
                { specializationOne: { $regex: specialization, $options: 'i' } },
                { specializationTwo: { $regex: specialization, $options: 'i' } }
            ]
        }

        if (location) {
            filterQuery['city'] = { $regex: location, $options: 'i' };
        }

        if (gender) {
            filterQuery['gender'] = gender
        }
        if (minPrice || maxPrice) {
            filterQuery['consultationFee'] = {};

            // If minPrice is provided, filter for fees greater than or equal to minPrice
            if (minPrice) {
                filterQuery['consultationFee'].$gte = parseFloat(minPrice);
            }

            // If maxPrice is provided, filter for fees less than or equal to maxPrice
            if (maxPrice) {
                filterQuery['consultationFee'].$lte = parseFloat(maxPrice);
            }
        }



        console.log("filter query 2: ", filterQuery);
        const doctors = await Doctor.find(filterQuery);
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No doctors found",
            })
        }

        console.log("doctors: ", doctors);
        return res.status(200).json({
            success: true,
            message: "Doctors fetched",
            doctors
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

