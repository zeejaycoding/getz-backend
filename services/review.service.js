const ReviewModel = require("../models/review.model");

const createReview = async (req, res) => {
  try {
    const { bookingId, riderId, driverId, message, stars } = req.body;
    console.log(bookingId, riderId, driverId, message, stars,'bookingId, riderId, driverId, message, stars')

    if (!bookingId || !stars) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newReview = await ReviewModel.create({
      bookingId, riderId, driverId, message, stars
    });

    return res.status(201).json({ msg: "Review submitted", data: newReview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

const getReviews = async (req, res) => {
  try {
    const { riderId, driverId } = req.query;

    let filter = {};
    if (riderId) filter.riderId = riderId;
    if (driverId) filter.driverId = driverId;

    const reviews = await ReviewModel.find(filter).populate("riderId").populate("driverId").sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Reviews fetched", data: reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await ReviewModel.findById(req.params.id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    return res.status(200).json({ data: review });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

const deleteReview = async (req, res) => {
  try {
    const deleted = await ReviewModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Review not found" });

    return res.status(200).json({ msg: "Review deleted", data: deleted });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  deleteReview
};
