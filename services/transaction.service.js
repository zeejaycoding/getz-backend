const Transaction = require("../models/transaction.history.model");
const WalletModel = require("../models/wallet/wallet.model");
const NotificationModel = require("../models/notification.model");

const createTransaction = async (req, res) => {
  try {
    const { riderId, driverId, amount, type } = req.body;

    const actions = {
      "ride payment": async () => {
        const riderMsg = `Ride payment sent - $${amount}`;
        const driverMsg = `Ride payment received - $${amount}`;

        await Transaction.insertMany([{ riderId, amount, message: riderMsg },{ driverId, amount, message: driverMsg }]);

        const driverWallet = await WalletModel.findOne({ driverId });
        if (driverWallet) {
          await WalletModel.findByIdAndUpdate(driverWallet._id, {$inc: { amount }});
        }

        await NotificationModel.insertMany([{ riderId, message: riderMsg },{ driverId, message: driverMsg }]);
      },

      "topup for driver": async () => {
        const message = `Balance credited in wallet - $${amount}`;
        await Transaction.create({ driverId, amount, message });

        const wallet = await WalletModel.findOne({ driverId });
        if (wallet) {
          await WalletModel.findByIdAndUpdate(wallet._id, {
            $inc: { amount }
          });
        }

        await NotificationModel.create({ driverId, message });
      },

      "topup for rider": async () => {
        const message = `Balance credited in wallet - $${amount}`;
        await Transaction.create({ riderId, amount, message });

        const wallet = await WalletModel.findOne({ riderId });
        if (wallet) {
          await WalletModel.findByIdAndUpdate(wallet._id, {
            $inc: { amount }
          });
        }

        await NotificationModel.create({ riderId, message });
      }
    };

    if (actions[type]) {
      await actions[type]();
      return res.status(201).json({ data: "Transaction history recorded" });
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

  } catch (err) {
    console.error("❌ Error creating transaction:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const getTransactionHistory = async (req, res) => {
  try {
    const { userId, role } = req.query;

    console.log(userId, role,'id role')

    if (!userId || !role) {
      return res.status(400).json({ message: "Missing userId or role" });
    }

    const filter = role === "driver"
      ? { driverId: userId }
      : { riderId: userId };

    const history = await Transaction.find(filter).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    console.error("❌ Error fetching transaction history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTransactionHistory, createTransaction }
