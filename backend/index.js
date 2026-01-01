const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 8080
const URL_ATLAS = process.env.URL_ATLAS


app.use(
    cors({
        origin: [
            "http://localhost:5173",              // local frontend
            "https://todo-frontend-vexg.onrender.com" // deployed frontend
        ],
        credentials: true,
    })
);

app.use(express.json())

mongoose
    .connect(URL_ATLAS)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err))

const userRouter = require('./routes/userRoute')
app.use('/user', userRouter)

app.listen(port, () => console.log("Server Started at port:-", port))


