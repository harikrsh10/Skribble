'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RoomProvider } from '@/lib/liveblocks'
import GameRoom from '@/components/GameRoom'
import { GameSettings } from '@/components/RoomSetup'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)

  // Load game settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setGameSettings(settings)
    } else {
      // Redirect to home if no settings
      router.push('/')
    }
  }, [router])

  if (!gameSettings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">Loading game...</div>
          <div className="text-gray-600">Please wait while we set up your game.</div>
        </div>
      </div>
    )
  }

  return (
    <RoomProvider 
      id={roomId} 
      initialPresence={{
        cursor: null,
        name: gameSettings.hostName,
        isDrawing: false,
        score: 0
      }}
      initialStorage={{
        canvas: {
          strokes: []
        },
        game: {
          currentWord: '',
          timeLeft: gameSettings.roundTime,
          isDrawer: false,
          messages: [],
          scores: {},
          currentRound: 1,
          totalRounds: gameSettings.totalRounds,
          roundStartTime: 0,
          correctGuesses: [],
          gameSettings: gameSettings
        }
      }}
    >
      <GameRoom roomId={roomId} />
    </RoomProvider>
  )
} 