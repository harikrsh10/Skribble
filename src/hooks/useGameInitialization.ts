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
          info: { 
            name: settings.hostName, 
            picture: settings.hostAvatar 
          },
          isAI: false,
          score: 0
        }

        const aiPlayers: Player[] = dummies.map(dp => ({
          id: dp.id,
          info: { 
            name: dp.name, 
            picture: dp.avatar 
          },
          isAI: dp.isAI,
          score: dp.score
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