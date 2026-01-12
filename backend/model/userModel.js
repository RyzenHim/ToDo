const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    attachments: [
        {
            url: String,
            public_id: String
        }]
    ,

    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    }

}, { timestamps: true })


module.exports = mongoose.model("authuser", userSchema)