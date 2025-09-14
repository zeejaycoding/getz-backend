const { multipleupload } = require("../../config/multer.config")
const { createAccount, getAccount, uploadPicture, fetchAllUsers, toogleAccountActivation, updateAccountOnboardingData, resendOtp, verifyOtp, loginAccount, changePassword } = require("../../services/rider/account.service")

const router = require("express").Router()


router.post("/register",createAccount)
router.post("/login",loginAccount)
router.post("/send/otp",resendOtp)
router.post("/verify/otp",verifyOtp)
router.post("/change/password",changePassword)
router.put("/update/:id",updateAccountOnboardingData)
router.get("/info/:id",getAccount)
router.put("/upload/:id",multipleupload.single("image"),uploadPicture)
router.get("/all",fetchAllUsers)
router.post("/toogle-account",toogleAccountActivation)

module.exports = router