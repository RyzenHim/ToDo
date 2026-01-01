const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 9090


app.use(cors())
app.use(express.json())

mongoose
    .connect(process.env.URL)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err))

const userRouter = require('./routes/userRoute')
app.use('/user', userRouter)

app.listen(port, () => console.log("Server Started at port:-", port))


