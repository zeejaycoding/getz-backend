const mongoose = require("mongoose")


const accountSchema = mongoose.Schema({
  source: { type: String, default: "Manual" },
  phone_number: { type: String, default: null },
  password: { type: String, default: null },

  username: { type: String, default: null },
  gender: { type: String, default: "Male" },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  vehicle_make: { type: String, default: "" },
  vehicle_color: { type: String, default: "" },
  vehicle_registration_number: { type: String, default: "" },

  driver_license_img: { type: String, default: null },
  vehicle_registration_img: { type: String, default: null },
  vehicle_img: { type: String, default: null },
  license_plate_img: { type: String, default: null },
  payment_method: { type: String, default: null },


  profile_img: { type: String, default: null },
  otp: { type: Number, default: null },
  otpVerified: { type: Boolean, default: false },
  accountVerified: { type: Boolean, default: false },
  accountBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })


const driverAccount = mongoose.model("driver", accountSchema, "driver")

module.exports = driverAccount
