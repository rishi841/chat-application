import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const JoinRoom = () => {
  const { roomId } = useParams()

  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [socket, setSocket] = useState(null)
  const [name, setName] = useState('')
  const [typingUser, setTypingUser] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])

  const typingTimeoutRef = useRef(null)
  const messageInputRef = useRef(null)

  const API = "http://localhost:3000"

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        let res = await axios.post(`${API}/room/join/${roomId}`, {
          lat: coords.latitude,
          long: coords.longitude
        })

        if (res.data.message === 'allowed') {
          const historyRes = await axios.get(`${API}/room/${roomId}/messages`)
          setChat(historyRes.data.messages)

          const s = io(API)
          s.emit('join-room', roomId)

          s.on('receive-message', (msg) => {
            setChat(prev => [...prev, msg])
          })

          s.on('user-typing', ({ sender }) => {
            setTypingUser(sender)
          })

          s.on('user-stop-typing', () => {
            setTypingUser('')
          })

          // NEW: listen for online users updates
          s.on('online-users', (users) => {
            setOnlineUsers(users)
          })

          setSocket(s)
        } else {
          alert('You are outside the range')
        }
      } catch (err) {
        console.log(err)
        console.log(err.response)
        alert(err.message)
      }
    })
  }, [])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!socket || !message || !name) return

    socket.emit('send-message', {
      roomId,
      message,
      sender: name
    })

    socket.emit('stop-typing', { roomId, sender: name })
    setMessage('')
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)

    if (!socket || !name) return

    socket.emit('typing', { roomId, sender: name })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId, sender: name })
    }, 1500)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (socket && name) {
        socket.emit('set-name', { roomId, name })
      }
      messageInputRef.current?.focus()
    }
  }

  // NEW: also send name if user clicks away from the name field
  const handleNameBlur = () => {
    if (socket && name) {
      socket.emit('set-name', { roomId, name })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-gray-900 to-gray-800 text-white">

      {/* Header */}
      <div className="p-3 bg-gray-950 flex justify-between items-center">
        <span className="font-semibold">Room: {roomId}</span>
        <span className="text-xs text-gray-400">{onlineUsers.length} online</span>
      </div>

      {/* Name Input */}
      <div className="p-3 bg-gray-900">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleNameKeyDown}
          onBlur={handleNameBlur}
          className="w-full p-2 rounded text-white"
        />
      </div>

      {/* Online users list */}
      {onlineUsers.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {onlineUsers.map((user, i) => (
            <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded-full text-green-400">
              ● {user}
            </span>
          ))}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((item, index) => {
          const isMe = item.sender === name

          return (
            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div>
                <p className="text-xs text-gray-400">{item.sender}</p>
                <p className={`px-4 py-2 rounded-2xl ${
                  isMe ? "bg-green-500" : "bg-blue-600"
                }`}>
                  {item.message}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <p className="px-4 text-sm text-gray-400 italic">{typingUser} is typing...</p>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 flex gap-2 bg-gray-950">
        <input
          ref={messageInputRef}
          type="text"
          placeholder="Type message..."
          className="flex-1 p-2 rounded text-white"
          value={message}
          onChange={handleTyping}
        />
        <button className="bg-blue-600 px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  )
}

export default JoinRoom