const { createBooking, updateBookingStatus, updateStopLocation, updateAcceptCancel, getBooking, updateTip, getBookingHistory, getOngoingBooking } = require("../services/booking/booking.service");
const router = require("express").Router()
router.get("/ongoing", getOngoingBooking);
router.post("", createBooking);
router.put("/status/:id", updateBookingStatus);
router.put("/stop/:id", updateStopLocation);
router.put("/accept-cancel/:id", updateAcceptCancel);
router.get("/:id?", getBooking);
router.put("/tip/:id", updateTip);
router.get("/history/all", getBookingHistory);



module.exports = router