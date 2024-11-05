const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

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


/*

userId: mongoose.Schema.Types.ObjectId
notification: [
    notificationType: 'appointment', 'message', 'reminder'
    message:  (string)
    date
    read (boolean)
]

*/