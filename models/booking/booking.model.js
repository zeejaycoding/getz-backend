// models/booking.model.js
const mongoose = require("mongoose");

const CoordinatesSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "rider", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver", required: true },
  pickupCoordinates: CoordinatesSchema,
  dropOffCoordinates: CoordinatesSchema,
  stopCoordinates: CoordinatesSchema,
  pickupAddress: String,
  dropOffAddress: String,
  stopAddress: String,
  fare: Number,
  distance: Number,
  status: { type: String, default: "ongoing" },
  paymentMethod: { type: String,required:true },
  accepted: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  bookingTime: { type: Date, default: Date.now },
  isSchedule: { type: Boolean, default: false },
  tip: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
