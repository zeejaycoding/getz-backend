const mongoose = require("mongoose")


const walletSchema = mongoose.Schema({
    riderId:{type:mongoose.Schema.Types.ObjectId,ref:"riderAccount",default:null},
    driverId:{type:mongoose.Schema.Types.ObjectId,ref:"driverAccount",default:null},
    amount:{type:Number},
},{timestamps:true})


const Wallet = mongoose.model("Wallet",walletSchema,"Wallet")

module.exports = Wallet