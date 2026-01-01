const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            return res.status(400).json({ message: "Toekn not found in auth page backend" })
        }
        let decode;
        try {
            decode = jwt.verify(token, secretKey)
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Token expired. Please login again.",
                    expired: true
                });
            }
        }

        // console.log("lets see whats inside the decode :-", decode);
        if (!decode) {
            return res.status(400).json({ message: "Token not decoded in auth page backend" })
        }

        const existingUser = await User.findOne({ email: decode.email }).select("-password");
        if (!existingUser) {
            return res.status(400).json({ message: "User not found in db, auth page backend" })
        }

        req.user = existingUser
        next()


    } catch (error) {
        return res.status(500).json("Internal server Error", error)
    }
}











































//  const authHeaders = req.headers.authorization
//         //  const token = req.headers.authorization.split(' ')[1];
//         if (!authHeaders) {
//             return res.status(401).json({ message: "Token not found" })
//         }
//         const token = authHeaders.split(" ")[1]
//         // jwt.verify(token, secretKey, (err, decoded) => {
//         //     if (err) {
//         //         if (err.name === "TokenExpiredError") {
//         //             return res.status(401).json({
//         //                 message: "Token expired. Please login again."
//         //             });
//         //         }
//         //         return res.status(401).json({
//         //             message: "Invalid token. Please login again."
//         //         });
//         //     }
//         //     req.user = decoded;
//         //     next();
//         // });

//         if (!token) {
//             return res.status(400).json({ message: "Invalid Token " })
//         }
//         const decode = jwt.verify(token, secretKey)
//         if (!decode) {
//             return res.status(400).json({ message: "Not Decoded" })
//         }
//         const email = decode.email
//         console.log("decode email", email);
//         const existingUser = await User.findOne({ email })
//         console.log("existingUser", existingUser);

//         if (!existingUser) {
//             return res.status(400).json({ message: "User Not found" })
//         }
//         req.user = existingUser
//         next()