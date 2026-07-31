const express = require('express')
const router = express.Router()
const roomController = require('../controllers/room.controller')

router.get('/nearby', roomController.getNearbyRooms)
router.post('/create',roomController.createRoom)
router.post('/join/:roomId',roomController.canJoinRoom)
router.get('/:roomId/messages', roomController.getMessages)


module.exports = router