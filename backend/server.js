require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const { createServer } = require("http")
const { Server } = require("socket.io")

const chatSocket = require("./sockets/socket")
const connectdb = require("./config/db")
const roomRoutes = require("./routes/room.routes")

const expServer = createServer(app)

connectdb()

const PORT = process.env.PORT || 4500

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}))

app.use(express.json())
app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})

app.use('/room', roomRoutes)

const io = new Server(expServer, {
  cors: {
    origin: "*"
  }
})

chatSocket(io)

expServer.listen(PORT, () => {
  console.log("server is running on port", PORT)
})