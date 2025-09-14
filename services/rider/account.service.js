const AccountModel = require("../../models/rider/account.model")
const driverAccount = require("../../models/driver/account.model")
const LocationModel = require("../../models/location.model");
const WalletModel = require("../../models/wallet/wallet.model");
const { uploadFile, generatePin, sendOtp } = require("../../utils/function")
const bcrypt = require("bcryptjs")


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
        const { username, payment_method, gender, phone_number, location } = req.body;
        const { id } = req.params;

        let account = await AccountModel.findById(id);
        if (!account) {
            return res.status(404).json({ msg: "Account not found" });
        }

        const updatedAccount = await AccountModel.findByIdAndUpdate(
            id,
            { username, payment_method, gender, phone_number, location },
            { new: true }
        );
        return res.status(200).json({ data: updatedAccount, msg: "Profile updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

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
        const accountId = req.params.id;
        const role = "rider"

        let findAccount = await AccountModel.findById(accountId);
        if (findAccount?.accountBlocked) {
            return res.status(404).json({ msg: "Account Not Found" });
        }

        if (!findAccount) {
            return res.status(404).json({ msg: "Account Not Found" });
        }

        let locationFilter = role === "rider" ? { riderId: accountId } : { driverId: accountId };
        const location = await LocationModel.findOne(locationFilter);

        return res.status(200).json({
            msg: null,
            data: { ...findAccount.toObject(), location: location || null, },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Error", data: null, error: error });
    }
};

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

module.exports = { createAccount, getAccount, uploadPicture, fetchAllUsers, toogleAccountActivation, updateAccountOnboardingData, loginAccount, resendOtp, verifyOtp, changePassword }