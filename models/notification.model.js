const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rider",
      default: null
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driver",
      default: null
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
