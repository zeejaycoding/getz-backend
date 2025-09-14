const express = require("express");
const { upsertLocation, getLocation } = require("../services/location.service");
const router = express.Router();

router.post("/update", upsertLocation);
router.get("/:role/:id", getLocation);

module.exports = router;