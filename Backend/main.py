import express from "express"


const app = express()

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("DB connected")
    })
    .catch((err) => {
        console.log("DB not connected")
    })

// For extracting body
app.use(express.json())
