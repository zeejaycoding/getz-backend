const express = require("express");
const router = express.Router();
const { getNotifications } = require("../services/notification.service");

router.get("/", getNotifications);

module.exports = router;
