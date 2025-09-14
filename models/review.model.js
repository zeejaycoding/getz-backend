const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "rider",default:null},
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver",default:null},
  message: { type: String },
  stars: { type: Number, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);
