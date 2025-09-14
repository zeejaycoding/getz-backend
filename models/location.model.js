const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver", default: null },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "rider", default: null },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { timestamps: true });

const LocationModel = mongoose.model("location", locationSchema, "location");

module.exports = LocationModel;