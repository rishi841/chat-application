import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const API = "http://localhost:3000"

function hashAngle(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

const CreateRoom = () => {
  const [loading, setLoading] = useState(false)
  const [nearby, setNearby] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await axios.get(`${API}/room/nearby`, {
          params: { lat: coords.latitude, long: coords.longitude }
        })
        setNearby(res.data.rooms)
      } catch (err) {
        console.log(err)
      }
    })
  }, [])

  function createroom() {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await axios.post(`${API}/room/create`, {
            lat: coords.latitude,
            long: coords.longitude
          })
          navigate(res.data.link)
        } catch (error) {
          alert("Backend connect nahi ho raha")
        } finally {
          setLoading(false)
        }
      },
      () => {
        alert("Location permission allow karo")
        setLoading(false)
      }
    )
  }

  const maxRadiusPx = 130

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: '#0A0E1A', color: '#EDEEF3', fontFamily: 'Inter, sans-serif' }}>
      <div className="w-[90%] max-w-md text-center">

        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: '#7C8496', textTransform: 'uppercase', marginBottom: 4 }}>
          Live nearby
        </p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
          Signals near you
        </h1>

        {/* Radar */}
        <div style={{ position: 'relative', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="radar-ring" style={{ animationDelay: `${i}s` }} />
          ))}

          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EDEEF3', zIndex: 2, boxShadow: '0 0 0 4px #0A0E1A' }} />

          {nearby.map(room => {
            const angle = hashAngle(room.roomId)
            const r = Math.min((room.distance / room.radius) * maxRadiusPx, maxRadiusPx)
            const x = 50 + (r * Math.cos(angle * Math.PI / 180)) / 2.8
            const y = 50 + (r * Math.sin(angle * Math.PI / 180)) / 2.8

            return (
              <div
                key={room.roomId}
                onClick={() => navigate(`/room/join/${room.roomId}`)}
                title={`${room.distance.toFixed(1)} km away`}
                style={{
                  position: 'absolute', top: `${y}%`, left: `${x}%`,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#F5A623', boxShadow: '0 0 8px #F5A62399',
                  cursor: 'pointer'
                }}
              />
            )
          })}
        </div>

        <button
          onClick={createroom}
          style={{ background: '#F5A623', color: '#412402', fontWeight: 500, border: 'none', borderRadius: 10, padding: 13, fontSize: 14, width: '100%', cursor: 'pointer' }}
        >
          {loading ? "Creating..." : "Create a room"}
        </button>

        <Link to="/nearby">
          <button style={{ background: 'transparent', color: '#2DD4BF', border: '1px solid #2DD4BF55', borderRadius: 10, padding: 13, fontSize: 14, width: '100%', cursor: 'pointer', marginTop: 10 }}>
            Browse nearby
          </button>
        </Link>

        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7C8496', marginTop: 16 }}>
          {nearby.length} active within 5 km
        </p>
      </div>

      <style>{`
        .radar-ring {
          position: absolute;
          border: 1px solid #F5A62333;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: radarPulse 3s ease-out infinite;
        }
        @keyframes radarPulse {
          0% { width: 20px; height: 20px; opacity: 1; }
          100% { width: 280px; height: 280px; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default CreateRoom