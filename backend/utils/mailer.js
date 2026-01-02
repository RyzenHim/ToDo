const nodemailer = require('nodemailer')



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSKEY,
    }



})

module.exports = transporter;