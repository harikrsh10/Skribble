'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameRoom from '@/components/GameRoom'
import RoomSetup, { GameSettings } from '@/components/RoomSetup'
import PlayerJoin from '@/components/PlayerJoin'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHost, setIsHost] = useState(false)
  const [playerJoined, setPlayerJoined] = useState(false)

  // Check if this user is the host (created the room)
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings')
    const savedRoomId = localStorage.getItem('currentRoomId')
    
    // If they have settings AND the room ID matches, they're the host
    if (savedSettings && savedRoomId === roomId) {
      const settings = JSON.parse(savedSettings)
      setGameSettings(settings)
      setIsHost(true)
    } else {
      // Clear any old settings if room ID doesn't match
      localStorage.removeItem('gameSettings')
      localStorage.removeItem('currentRoomId')
    }
    
    setIsLoading(false)
  }, [roomId])

  const handleStartGame = (settings: GameSettings) => {
    // Save settings to localStorage with room ID
    localStorage.setItem('gameSettings', JSON.stringify(settings))
    localStorage.setItem('currentRoomId', roomId)
    setGameSettings(settings)
  }

  const handlePlayerJoin = (playerName: string, playerAvatar: string) => {
    // Save player info to localStorage
    localStorage.setItem('playerInfo', JSON.stringify({
      name: playerName,
      avatar: playerAvatar,
      roomId
    }))
    setPlayerJoined(true)
  }

  const handleCancel = () => {
    // Clear settings and redirect to home page
    localStorage.removeItem('gameSettings')
    localStorage.removeItem('currentRoomId')
    localStorage.removeItem('playerInfo')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">Loading game...</div>
          <div className="text-gray-600">Please wait while we set up your game.</div>
        </div>
      </div>
    )
  }

  // If host with settings, show GameRoom
  if (isHost && gameSettings) {
    return <GameRoom roomId={roomId} />
  }

  // If host without settings, show RoomSetup
  if (isHost && !gameSettings) {
    return (
      <RoomSetup 
        roomId={roomId} 
        onStartGame={handleStartGame}
        onCancel={handleCancel}
      />
    )
  }

  // If player has joined, show GameRoom
  if (playerJoined) {
    return <GameRoom roomId={roomId} />
  }

  // If new player joining, show PlayerJoin
  return (
    <PlayerJoin 
      roomId={roomId} 
      onJoinRoom={handlePlayerJoin}
      onCancel={handleCancel}
    />
  )
} 