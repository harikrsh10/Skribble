'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RoomSetup, { GameSettings } from '@/components/RoomSetup'

export default function Home() {
  const [roomId, setRoomId] = useState('')
  const [showRoomSetup, setShowRoomSetup] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState('')
  const router = useRouter()

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8)
    setCurrentRoomId(newRoomId)
    setShowRoomSetup(true)
  }

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`)
    }
  }

  const handleStartGame = (settings: GameSettings) => {
    // Store settings in localStorage for the game to use
    localStorage.setItem('gameSettings', JSON.stringify(settings))
    localStorage.setItem('currentRoomId', currentRoomId)
    router.push(`/room/${currentRoomId}`)
  }

  const handleCancelSetup = () => {
    setShowRoomSetup(false)
    setCurrentRoomId('')
  }

  if (showRoomSetup) {
    return (
      <RoomSetup
        roomId={currentRoomId}
        onStartGame={handleStartGame}
        onCancel={handleCancelSetup}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Pictior
        </h1>
        <p className="text-gray-600 text-center mb-8">
          A real-time multiplayer drawing game
        </p>
        
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Create New Room
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 