const express = require("express");
const router = express.Router();
const {getTransactionHistory, createTransaction}  = require("../services/transaction.service")
router.post("/", createTransaction)
router.get("/", getTransactionHistory)

module.exports = router
