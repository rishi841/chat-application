const roomModel = require('../models/room.model')
const messageModel = require('../models/Message.model')
const calculateDistance = require('../utils/CalculateDistance')

async function createRoom(req, res) {
  try {
    console.log("Body:", req.body);

    const { lat, long } = req.body;

    if (lat == null || long == null) {
      return res.status(400).json({
        message: "lat and long is required",
      });
    }

    const roomId = Math.random().toString(36).substring(2, 10);

    const newRoom = await roomModel.create({
      roomId,
      lat: Number(lat),
      long: Number(long),
      radius: 5,
    });

    return res.status(200).json({
      link: `/room/join/${roomId}`,
      room: newRoom,
    });
  } catch (err) {
    console.log("Create Room Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
}

async function canJoinRoom(req, res) {
  const { lat, long } = req.body
  const { roomId } = req.params

  if (!lat || !long) {
    return res.status(400).json({
      message: 'lat and long is required'
    })
  }

  const room = await roomModel.findOne({ roomId })

  if (!room) {
    return res.status(404).json({
      message: 'room not found'
    })
  }

  const distance = calculateDistance(
    Number(lat),
    Number(long),
    Number(room.lat),
    Number(room.long)
  )

  console.log("Distance:", distance)

  if (distance > room.radius) {
    return res.status(400).json({
      message: 'you are outside the range'
    })
  }

  return res.status(200).json({
    message: 'allowed'
  })
}

async function getMessages(req, res) {
  try {
    const { roomId } = req.params

    const messages = await messageModel.find({ roomId }).sort({ createdAt: 1 })

    return res.status(200).json({
      messages
    })
  } catch (err) {
    console.log("Get Messages Error:", err)
    return res.status(500).json({
      message: "internal server error"
    })
  }
}

async function getNearbyRooms(req, res) {
  try {
    const { lat, long } = req.query

    if (!lat || !long) {
      return res.status(400).json({
        message: "lat and long is required"
      })
    }

    // only rooms active in the last 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const rooms = await roomModel.find({ lastActive: { $gte: cutoff } })

    const nearbyRooms = rooms
      .map(room => {
        const distance = calculateDistance(
          Number(lat), Number(long),
          Number(room.lat), Number(room.long)
        )
        return { ...room.toObject(), distance }
      })
      .filter(room => room.distance <= room.radius)
      .sort((a, b) => a.distance - b.distance)

    return res.status(200).json({ rooms: nearbyRooms })
  } catch (err) {
    console.log("Get Nearby Rooms Error:", err)
    return res.status(500).json({ message: "internal server error" })
  }
}

module.exports={
   canJoinRoom,
   createRoom,
   getMessages,
   getNearbyRooms
}