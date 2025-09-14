const mongoose = require("mongoose")


const accountSchema = mongoose.Schema({
    source: { type: String, default: "Manual" },
    phone_number: { type: String, default: null },
    gender: { type: String, default: "Male" },
    location: { type: String, default: "" },
    password: { type: String, default: null },
    username: { type: String, default: null },
    profile_img: { type: String, default: null },
    payment_method: { type: String, default: null },
    otp: { type: Number, default: null },
    otpVerified: { type: Boolean, default: false },
    accountVerified: { type: Boolean, default: false },
    accountBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })


const riderAccount = mongoose.model("rider", accountSchema, "rider")

module.exports = riderAccount
