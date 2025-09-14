
const LocationModel = require("../models/location.model");

const upsertLocation = async (req, res) => {
    try {
        const { driverId, riderId, latitude, longitude } = req.body;

        if (!latitude || !longitude || (!driverId && !riderId)) {
            return res.status(400).json({ msg: "Missing required fields", status: 400 });
        }

        let filter = driverId ? { driverId } : { riderId };
        let update = { latitude, longitude, ...filter };

        const updatedLocation = await LocationModel.findOneAndUpdate(
            filter,
            update,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            data: updatedLocation,
            msg: "Location updated successfully",
            status: 200
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
};

const getLocation = async (req, res) => {
    try {
        const { role, id } = req.params;

        if (!["driver", "rider"].includes(role)) {
            return res.status(400).json({ msg: "Invalid role", status: 400 });
        }
        let filter = role === "driver" ? { driverId: id } : { riderId: id };
        const location = await LocationModel.findOne(filter).populate("riderId").populate("driverId");
        if (!location) {
            return res.status(404).json({ msg: "Location not found", status: 404 });
        }
        return res.status(200).json({ data: location, msg: "Location fetched", status: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
};

module.exports = { upsertLocation, getLocation };
