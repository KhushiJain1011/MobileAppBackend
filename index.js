
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");

// require('dotenv').config({ path: './.env' });

const PORT = process.env.PORT || 7000;
const url = process.env.URL

const app = express();

app.use(cors());
app.use(express.json());

// console.log("mongo url: ", process.env.URL)

app.use("/api/user", userRoutes);

mongoose.connect(url)
    .then(() => console.log("CONNECTED TO MONGODB!!"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));


app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`)
})