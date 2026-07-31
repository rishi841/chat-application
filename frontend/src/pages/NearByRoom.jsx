import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const NearbyRooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const API = "http://localhost:3000"

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await axios.get(`${API}/room/nearby`, {
            params: {
              lat: coords.latitude,
              long: coords.longitude
            }
          })
          setRooms(res.data.rooms)
        } catch (err) {
          console.log(err)
          setError('Could not load nearby rooms')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.log("Location error:", err)
        setError('Location permission allow karo')
        setLoading(false)
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Nearby Rooms</h1>

      {loading && <p className="text-center text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && rooms.length === 0 && (
        <p className="text-center text-gray-400">No active rooms nearby</p>
      )}

      <div className="max-w-md mx-auto space-y-3">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            onClick={() => navigate(`/room/join/${room.roomId}`)}
            className="bg-gray-950 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
          >
            <div>
              <p className="font-semibold">Room {room.roomId}</p>
              <p className="text-sm text-gray-400">{room.distance.toFixed(2)} km away</p>
            </div>
            <span className="text-blue-400 text-sm">Join →</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NearbyRooms