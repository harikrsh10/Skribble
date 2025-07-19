'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameRoom from '@/components/GameRoom'
import RoomSetup, { GameSettings } from '@/components/RoomSetup'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load game settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setGameSettings(settings)
    }
    setIsLoading(false)
  }, [])

  const handleStartGame = (settings: GameSettings) => {
    // Save settings to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(settings))
    setGameSettings(settings)
  }

  const handleCancel = () => {
    // Redirect to home page
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

  // If no settings (new player joining), show RoomSetup
  if (!gameSettings) {
    return (
      <RoomSetup 
        roomId={roomId} 
        onStartGame={handleStartGame}
        onCancel={handleCancel}
      />
    )
  }

  // If settings exist (returning player), show GameRoom
  return <GameRoom roomId={roomId} />
} 