const  mongoose = require("mongoose")
const transactionSchema = new mongoose.Schema(
  {
    riderId: {type: mongoose.Schema.Types.ObjectId,ref: "rider",default:null},
    driverId: {type: mongoose.Schema.Types.ObjectId,ref: "driver",default:null},
    amount: {type: Number,required: true,},
    message: {type: String,required: true,},
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
