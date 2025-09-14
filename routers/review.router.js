const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  deleteReview
} = require("../services/review.service");

router.post("", createReview); 
router.get("", getReviews);
router.get("/:id", getReviewById);
router.delete("/:id", deleteReview); 

module.exports = router;
