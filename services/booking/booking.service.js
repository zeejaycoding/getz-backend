const { emitToUser } = require("../../config/socket.config");
const BookingModel = require("../../models/booking/booking.model");
const DriverAccountModel = require("../../models/driver/account.model");
const NotificationModel = require("../../models/notification.model");
const WalletModel = require("../../models/wallet/wallet.model")
const TransactionModel = require("../../models/transaction.history.model");
const { calculateDistance } = require("../../utils/function");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      riderId,
      driverId,
      pickupCoordinates,
      dropOffCoordinates,
      pickupAddress,
      dropOffAddress,
      isSchedule,
      paymentMethod
    } = req.body;

    const riderWallet = await WalletModel.findOne({ riderId });
    const distance = calculateDistance(pickupCoordinates, dropOffCoordinates);
    const driver = await DriverAccountModel.findById(driverId);
    const perKmRate = driver?.perKmRate || 3;
    const fare = parseFloat((distance * perKmRate).toFixed(2));

    // if (paymentMethod === "Ryde Credits" && riderWallet.amount < fare) {
    //   return res.status(403).json({ msg: "Not enough credit in wallet", data: null });
    // }

    const newBooking = await BookingModel.create({
      riderId,
      driverId,
      pickupCoordinates,
      dropOffCoordinates,
      pickupAddress,
      dropOffAddress,
      fare,
      distance,
      isSchedule,
      status: "pending_approval",
      paymentMethod
    });

    const bookingInfo = await BookingModel.findById(newBooking?._id)
      .populate("driverId")
      .populate("riderId");

    await DriverAccountModel.findByIdAndUpdate(driverId, { $set: { online: false } });

    await NotificationModel.create({ riderId, message: "New ride created" });
    await NotificationModel.create({ driverId, message: "You have received a new ride" });

    emitToUser(driverId.toString(), "newBookingRequest", bookingInfo);

    return res.status(201).json({ msg: "Booking created", data: newBooking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};



// Update Stop Location and Recalculate Fare
const updateStopLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { stopCoordinates, stopAddress } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const distance = calculateDistance(booking.pickupCoordinates, stopCoordinates) +
      calculateDistance(stopCoordinates, booking.dropOffCoordinates);

    const driver = await DriverAccountModel.findById(booking.driverId);
    const perKmRate = driver?.perKmRate || 3;
    const fare = parseFloat((distance * perKmRate).toFixed(2));

    booking.stopCoordinates = stopCoordinates;
    booking.stopAddress = stopAddress;
    booking.distance = distance;
    booking.fare = fare;

    await booking.save();
    return res.status(200).json({ msg: "Stop updated", data: booking });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Accept or Cancel
const updateAcceptCancel = async (req, res) => {
  try {
    const { id } = req.params;
    const { accepted, cancelled } = req.body;
    

    const update = {};
    const bookingInfo = await BookingModel.findById(id);

    if (!bookingInfo) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const { riderId, driverId, fare, paymentMethod } = bookingInfo;

    // if (accepted !== undefined) {
    //   update.accepted = accepted;
    //   update.status = "ongoing";

    //   if (paymentMethod === "Ryde Credits") {
    //     const riderWallet = await WalletModel.findOne({ riderId });
    //     const driverWallet = await WalletModel.findOne({ driverId });

    //     if (!riderWallet || riderWallet.amount < fare) {
    //       return res.status(403).json({ msg: "Insufficient balance for rider" });
    //     }

    //     // 💳 Deduct and transfer
    //     riderWallet.amount -= fare;
    //     await riderWallet.save();

    //     if (driverWallet) {
    //       driverWallet.amount += fare;
    //       await driverWallet.save();
    //     } else {
    //       await WalletModel.create({ driverId, amount: fare });
    //     }

    //     // 🧾 Transactions
    //     await TransactionModel.create({
    //       riderId,
    //       amount: fare,
    //       message: `Paid fare of $${fare} to driver`
    //     });
    //     await TransactionModel.create({
    //       driverId,
    //       amount: fare,
    //       message: `Received fare of $${fare} from rider`
    //     });
    //   }

    //   await NotificationModel.create({ driverId, message: "Ride accepted" });
    //   await NotificationModel.create({ riderId, message: "Ride accepted by driver" });
    // }

    if (cancelled !== undefined) {
      update.cancelled = cancelled;
      update.status = "decline";
      await NotificationModel.create({ driverId, message: "Ride declined" });
      await NotificationModel.create({ riderId, message: "Ride declined by driver" });
    }

    const updated = await BookingModel.findByIdAndUpdate(id, update, { new: true });
    const fullBookingInfo = await BookingModel.findById(id)
      .populate("driverId")
      .populate("riderId");

    if (accepted !== undefined) {
      emitToUser(updated.riderId.toString(), "bookingAccepted", fullBookingInfo);
    }

    if (cancelled !== undefined) {
      emitToUser(updated.riderId.toString(), "bookingCancelled", fullBookingInfo);
    }

    return res.status(200).json({ msg: "Booking updated", data: fullBookingInfo });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Update Booking Status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await BookingModel.findByIdAndUpdate(id, { status }, { new: true });
    await DriverAccountModel.findByIdAndUpdate(updated?.driverId, { $set: { online: true } }, { new: true });
    if (status === "completed") {
      await NotificationModel.create({ driverId: updated?.driverId, message: "Ride completed" })
      await NotificationModel.create({ riderId: updated?.riderId, message: "Ride completed" })
      emitToUser(updated.riderId.toString(), "rideCompleted", updated);
    }
    return res.status(200).json({ msg: "Status updated", data: updated });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get by ID, riderId or driverId
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { ...(req.query.riderId && { riderId: req.query.riderId }), ...(req.query.driverId && { driverId: req.query.driverId }), };
    const data = id ? await BookingModel.findById(id) : await BookingModel.find(query).populate("riderId").populate("driverId").sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Fetched", data });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Update Tip
const updateTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { tip } = req.body;

    const updated = await BookingModel.findByIdAndUpdate(id, { tip }, { new: true });
    return res.status(200).json({ msg: "Tip updated", data: updated });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get Booking History
const getBookingHistory = async (req, res) => {
  try {
    const { riderId, driverId } = req.query;

    const filter = {};
    if (riderId) filter.riderId = riderId;
    if (driverId) filter.driverId = driverId;

    const history = await BookingModel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ msg: "Booking history", data: history });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

const getOngoingBooking = async (req, res) => {
  try {
    let { riderId, driverId } = req.query
    const query = { ...(riderId && { riderId, accepted: true, status: "ongoing" }), ...(driverId && { driverId, accepted: true, status: "ongoing" }), };
    const data = await BookingModel.findOne(query).populate("riderId").populate("driverId").sort({ createdAt: -1 });
    return res.status(200).json({ msg: "Fetched", data });
  }
  catch (error) {
    console.log(error)
  }
}

module.exports = {
  createBooking,
  updateBookingStatus,
  updateStopLocation,
  updateAcceptCancel,
  getBooking,
  updateTip,
  getBookingHistory,
  getOngoingBooking
};
