const messageModel = require('../models/Message.model')
const roomModel = require('../models/room.model')

// keeps track of who's online in each room
// structure: { roomId: { socketId: username } }
const onlineUsers = {}

function getUsernamesInRoom(roomId) {
  if (!onlineUsers[roomId]) return []
  return Object.values(onlineUsers[roomId]).filter(name => name)
}

const chatSocket = (io) => {
  io.on('connection', (socket) => {

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      socket.data.roomId = roomId   // remember which room this socket is in

      if (!onlineUsers[roomId]) onlineUsers[roomId] = {}
      onlineUsers[roomId][socket.id] = ''   // name not set yet

      io.to(roomId).emit('online-users', getUsernamesInRoom(roomId))
    })

    // NEW: called once the user types their name
    socket.on('set-name', ({ roomId, name }) => {
      socket.data.name = name

      if (onlineUsers[roomId]) {
        onlineUsers[roomId][socket.id] = name
        io.to(roomId).emit('online-users', getUsernamesInRoom(roomId))
      }
    })

    socket.on('send-message', async ({ roomId, message, sender }) => {
      try {
        await messageModel.create({ roomId, sender, message })
        await roomModel.updateOne({ roomId }, { lastActive: new Date() })
      } catch (err) {
        console.log("Error saving message:", err)
      }

      io.to(roomId).emit('receive-message', {
        message,
        sender
      })
    })

    socket.on('typing', ({ roomId, sender }) => {
      socket.to(roomId).emit('user-typing', { sender })
    })

    socket.on('stop-typing', ({ roomId, sender }) => {
      socket.to(roomId).emit('user-stop-typing', { sender })
    })

    // NEW: cleanup when someone disconnects
    socket.on('disconnect', () => {
      const roomId = socket.data.roomId
      if (roomId && onlineUsers[roomId]) {
        delete onlineUsers[roomId][socket.id]
        io.to(roomId).emit('online-users', getUsernamesInRoom(roomId))
      }
    })

  })
}

module.exports = chatSocket