const Notification = require("../models/notification.model");


const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ message: "Missing userId or role" });
    }

    const filter = role === "driver" ? { driverId: userId } : { riderId: userId };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {getNotifications}
