const { multipleupload } = require("../../config/multer.config")
const { createAccount, getAccount, uploadPicture, fetchAllUsers, toogleAccountActivation, updateAccountOnboardingData, resendOtp, verifyOtp, loginAccount, changePassword, toggleOnlineStatus, getOnlineDriversWithLocation, updatePerKmRate } = require("../../services/driver/account.service")
const router = require("express").Router()


router.post("/register",createAccount)
router.post("/login",loginAccount)
router.post("/send/otp",resendOtp)
router.post("/verify/otp",verifyOtp)
router.post("/change/password",changePassword)
router.put("/update/:id",  multipleupload.fields([
    { name: "driver_license_img", maxCount: 1 },
    { name: "vehicle_registration_img", maxCount: 1 },
    { name: "vehicle_img", maxCount: 1 },
    { name: "license_plate_img", maxCount: 1 },
]),
updateAccountOnboardingData)
router.get("/info/:id",getAccount)
router.put("/upload/:id",multipleupload.single("image"),uploadPicture)
router.get("/all",fetchAllUsers)
router.post("/toogle-account",toogleAccountActivation)
router.post("/online/toggle", toggleOnlineStatus);
router.get("/online/list", getOnlineDriversWithLocation);
router.post("/update-per-km-rate", updatePerKmRate);

module.exports = router