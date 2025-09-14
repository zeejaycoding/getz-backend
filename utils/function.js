const { storage } = require("../config/firebase.config");
const { getDownloadURL, ref, uploadBytes } = require("@firebase/storage");
const twilio = require('twilio');
const accountSid = "AC98e81587a272aca41185294efba3d170";
const authToken = "a62560e3bebc4a9f4b3305fa8363bac1";
const twilioPhoneNumber = "+447445133064";

const client = twilio(accountSid, authToken);

const toRad = (value) => (value * Math.PI) / 180;

module.exports = {
    sendOtp: async (phoneNumber, otp) => {
        try {
            const message = await client.messages.create({ body: `Your OTP for getz account verification is: ${otp}`, from: twilioPhoneNumber, to: phoneNumber, });
            console.log('Message sent:', message.sid);
            return { success: true, sid: message.sid };
        }
        catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, error: error.message };
        }
    },
    generatePin: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    uploadFile: (async (file) => {
        let files = Array.isArray(file) ? file[0] : file
        const uniqueFilename = `${files?.originalname || "image"}-${Date.now()}`;
        const storageRef = ref(storage, uniqueFilename);
        const arrayBuffer = Uint8Array.from(files.buffer);
        await uploadBytes(storageRef, arrayBuffer, {
            contentType: files.mimetype,
        });
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    }),
    calculateDistance: (coord1, coord2) => {
        const R = 6371;
        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude - coord1.longitude);
        const lat1 = toRad(coord1.latitude);
        const lat2 = toRad(coord2.latitude);

        const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },


}