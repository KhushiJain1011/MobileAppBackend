
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const walletRoutes = require("./routes/walletRoutes");

// require('dotenv').config({ path: './.env' });

const PORT = process.env.PORT || 7000;
const url = process.env.URL

const app = express();

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.set('views', './views'); // Set the views directory

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// console.log("mongo url: ", process.env.URL)

app.use("/api/user", userRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/wallet", walletRoutes);

mongoose.connect(url)
    .then(() => console.log("CONNECTED TO MONGODB!!"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));


app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`)
})