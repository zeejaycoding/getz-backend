const AccountModel = require("../../models/driver/account.model")
const driverAccount = require("../../models/driver/account.model")
const LocationModel = require("../../models/location.model");
const { uploadFile, generatePin, sendOtp } = require("../../utils/function")
const { sendDynamicMail } = require("../../utils/email")
const WalletModel = require("../../models/wallet/wallet.model");
const bcrypt = require("bcryptjs")
// 375993
const createAccount = async (req, res) => {
    try {
        let { phone_number, password } = req.body
        let findAccount = await AccountModel.findOne({ phone_number })
        if (findAccount) {
            return res.status(400).json({ msg: "Account Exits", data: findAccount })
        }
        else {
            let pin = generatePin()
            await sendOtp(phone_number, pin)
            let hash = await bcrypt.hash(password, 10)
            let result = await AccountModel.create({ phone_number, otp: pin, password: hash })
            await WalletModel.create({ riderId: result?._id, amount: 0 })
            return res.status(200).json({ data: result, pin, msg: "Account Created. Kindly Complete Your Profile", status: 200 })

        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Error", data: null, error: error })
    }
}

const updateAccountOnboardingData = async (req, res) => {
    try {
        let { username, gender, city, country, vehicle_make, vehicle_color, vehicle_registration_number, payment_method } = req.body
        let { id } = req?.params
        const files = req.files;
        const driver_license_img = await uploadFile(files.driver_license_img);
        const vehicle_registration_img = await uploadFile(files.vehicle_registration_img);
        const vehicle_img = await uploadFile(files.vehicle_img);
        const license_plate_img = await uploadFile(files.license_plate_img);
        let alreadyExits = await AccountModel.findById(id)
        if (!alreadyExits) {
            return res.status(400).json({ data: { accountVerified: alreadyExits?.accountVerified, userInfo: null }, msg: "Account not exits with this email", code: 400 })
        }
        let result = await AccountModel.findByIdAndUpdate(id, { username, gender, city, country, vehicle_make, vehicle_color, vehicle_registration_number, payment_method, driver_license_img, vehicle_img, license_plate_img, vehicle_registration_img }, { new: true })
        return res.status(200).json({ data: result, msg: "Account Details Updated", status: 200 })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error", error });
    }
}

const loginAccount = async (req, res) => {
    try {
        let { phone_number, password } = req.body
        let findUser = await AccountModel.findOne({ phone_number })
        if (!findUser) {
            return res.status(400).json({ data: null, msg: "Account not exits with this phone number", code: 400 })
        }
        else if (!findUser?.accountVerified) {
            let pin = generatePin()
            await sendOtp(phone_number, pin)
            await AccountModel.findByIdAndUpdate(findUser?._id, { otp: pin }, { new: true })
            return res.status(401).json({ data: findUser, msg: "Account not verified", code: 401 })
        }
        else if (findUser?.accountBlocked) {
            return res.status(400).json({ data: findUser, msg: "Account has been deleted", code: 400 })
        }
        else {
            let compare = await bcrypt.compare(password, findUser.password)
            if (compare) {
                return res.status(200).json({ data: findUser, msg: "Login Sucessful", code: 200 })
            }
            else {
                return res.status(403).json({ data: null, msg: "Invalid credentails", code: 403 })
            }
        }
    }
    catch (error) {
        console.log(error)
    }
}


const resendOtp = async (req, res) => {
    try {
        let { phone_number } = req.body
        let findUser = await AccountModel.findOne({ phone_number })
        if (!findUser) {
            return res.status(400).json({ data: null, msg: "Account not exits with this phone number", code: 400 })
        }
        let pin = generatePin()
        await sendOtp(phone_number, pin)
        await AccountModel.findByIdAndUpdate(findUser?._id, { otp: pin, otpVerified: false }, { new: true })
        return res.status(200).json({ data: null, msg: "OTP send sucessfully to phone number", code: 200 })
    }
    catch (error) {
        console.log(error)
    }
}
const verifyOtp = async (req, res) => {
    try {
        let { phone_number, otp } = req.body
        let user = await AccountModel.findOne({ phone_number })
        if (!user) {
            return res.status(400).json({ data: null, msg: "Account not exits with this phone number", code: 400 })
        }
        else {
            if (otp == user?.otp) {
                let verifiedResponse = await AccountModel.findByIdAndUpdate(user?._id, { otp: null, otpVerified: true, accountVerified: true }, { new: true })
                return res.status(200).json({ data: verifiedResponse, msg: "Account Verified", code: 200 })
            }
            else {
                return res.status(403).json({ msg: "Invalid Otp", code: 403 })
            }

        }

    }
    catch (error) {
        console.log(error)
    }
}

const changePassword = async (req, res) => {
    try {
        let { phone_number, password } = req.body
        let user = await AccountModel.findOne({ phone_number })
        if (!user) {
            return res.status(400).json({ data: null, msg: "Account not exits with this phone number", code: 400 })
        }
        else {
            if (user?.otpVerified) {
                let hash = await bcrypt.hash(password, 10)
                let verifiedResponse = await AccountModel.findByIdAndUpdate(user?._id, { password: hash }, { new: true })
                return res.status(200).json({ data: verifiedResponse, msg: "Password Changed", code: 200 })
            }
            return res.status(403).json({ data: user, msg: "OTP NOT VERIFIED", code: 200 })
        }

    }
    catch (error) {
        console.log(error)
    }
}


const getAccount = async (req, res) => {
    try {
        let findAccount = await AccountModel.findById(req.params.id)
        if (findAccount?.accountBlocked) {
            return res.status(404).json({ msg: "Account Not Found" })
        }
        else if (findAccount) {
            return res.status(201).json({ msg: null, data: findAccount })
        }
        else {
            return res.status(404).json({ msg: "Account Not Found" })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Error", data: null, error: error })
    }
}

const uploadPicture = async (req, res) => {
    try {
        let { id } = req.params;
        let image = req.file
        let url = await uploadFile(image);
        let updateProfile = await AccountModel.findByIdAndUpdate(id, { profile_img: url }, { new: true })
        return res.status(200).json({ data: updateProfile, msg: "Profile Picture Updated" })
    }
    catch (error) {
        console.log(error)
    }
}


const fetchAllUsers = async (req, res) => {
    try {
        let riders = await AccountModel.find().sort({ createdAt: -1 })
        let drivers = await driverAccount.find().sort({ createdAt: -1 })
        return res.status(200).json({ data: [...riders, ...drivers] })

    }
    catch (error) {

    }
}

const toogleAccountActivation = async (req, res) => {
    try {
        let { accountId, toogle, role } = req.body
        if (role == "rider") {
            let toogleAccount = await AccountModel.findByIdAndUpdate(accountId, { accountBlocked: Boolean(toogle) }, { new: true })
            return res.status(200).json({ data: toogleAccount, msg: `Account ${Boolean(toogle) ? "Deactivated" : "Activated"} ` })
        }
        else {
            let toogleAccount = await driverAccount.findByIdAndUpdate(accountId, { accountBlocked: Boolean(toogle) }, { new: true })
            return res.status(200).json({ data: toogleAccount, msg: `Account ${Boolean(toogle) ? "Deactivated" : "Activated"} ` })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ data: null, msg: error })
    }
}

const toggleOnlineStatus = async (req, res) => {
    try {
        const { driverId, online } = req.body;

        const driver = await AccountModel.findByIdAndUpdate(
            driverId,
            { online: Boolean(online) },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ msg: "Driver not found", status: 404 });
        }

        return res.status(200).json({
            data: driver,
            msg: `Driver is now ${online ? "online" : "offline"}`,
            status: 200
        });
    } catch (error) {
        console.error("toggleOnlineStatus error:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};
const getOnlineDriversWithLocation = async (req, res) => {
    try {
        const onlineDrivers = await AccountModel.find({ online: true });
        const driversWithLocation = await Promise.all(
            onlineDrivers.map(async (driver) => {
                const location = await LocationModel.findOne({ driverId: driver._id });
                return {
                    driver,
                    location
                };
            })
        );

        return res.status(200).json({
            data: driversWithLocation,
            msg: "Online drivers with location fetched",
            status: 200
        });
    } catch (error) {
        console.error("getOnlineDriversWithLocation error:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

const updatePerKmRate = async (req, res) => {
    try {
        const { driverId, rate } = req.body;

        if (!driverId || rate == null) {
            return res.status(400).json({ msg: "Missing driverId or rate", status: 400 });
        }

        const updatedDriver = await AccountModel.findByIdAndUpdate(
            driverId,
            { perKmRate: rate },
            { new: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ msg: "Driver not found", status: 404 });
        }

        return res.status(200).json({
            data: updatedDriver,
            msg: "Per-km rate updated successfully",
            status: 200
        });
    } catch (error) {
        console.error("updatePerKmRate error:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};


module.exports = { updatePerKmRate, toggleOnlineStatus, getOnlineDriversWithLocation, createAccount, getAccount, uploadPicture, fetchAllUsers, toogleAccountActivation, updateAccountOnboardingData, loginAccount, resendOtp, verifyOtp, changePassword }