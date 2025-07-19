import { useState, useEffect } from 'react'
import { Player, GameSettings } from '@/types/game'
import { generateDummyPlayers } from '@/lib/dummyPlayers'

export function useGameInitialization() {
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeGame = () => {
      try {
        const savedSettings = localStorage.getItem('gameSettings')
        if (!savedSettings) {
          setIsLoading(false)
          return
        }

        const settings: GameSettings = JSON.parse(savedSettings)
        setGameSettings(settings)

        // Generate dummy players
        const dummies = generateDummyPlayers(3) // 3 AI players

        // Create all players array (host + dummies)
        const hostPlayer: Player = {
          id: 'player1',
          name: settings.hostName,
          avatar: settings.hostAvatar,
          isOnline: true,
          isDrawer: false,
          score: 0,
          joinedAt: Date.now(),
          isAI: false,
          info: { 
            name: settings.hostName, 
            picture: settings.hostAvatar 
          }
        }

        const aiPlayers: Player[] = dummies.map(dp => ({
          id: dp.id,
          name: dp.name,
          avatar: dp.avatar,
          isOnline: true,
          isDrawer: false,
          score: dp.score,
          joinedAt: Date.now(),
          isAI: dp.isAI,
          info: { 
            name: dp.name, 
            picture: dp.avatar 
          }
        }))

        const allPlayersArray = [hostPlayer, ...aiPlayers]
        setAllPlayers(allPlayersArray)

        // Initialize scores
        const initialScores: Record<string, number> = {}
        allPlayersArray.forEach(player => {
          initialScores[player.id] = player.score
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing game:', error)
        setIsLoading(false)
      }
    }

    initializeGame()
  }, [])

  return {
    gameSettings,
    allPlayers,
    isLoading
  }
} 