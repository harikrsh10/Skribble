import { useEffect, useCallback, useRef } from 'react'
import { Player, GameMessage } from '@/types/game'
import { getRandomWord } from '@/lib/words'
import { simulateAIGuess, simulateAIMessage } from '@/lib/dummyPlayers'

interface UseGameLogicProps {
  gameSettings: any
  allPlayers: Player[]
  state: any
  actions: any
}

export function useGameLogic({ gameSettings, allPlayers, state, actions }: UseGameLogicProps) {
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start new round
  const startNewRound = useCallback(() => {
    if (!gameSettings || allPlayers.length === 0) return
    
    const newWord = getRandomWord(gameSettings.selectedCategories, gameSettings.allowAdultWords)
    actions.setCurrentWord(newWord)
    actions.setStrokes([])
    actions.setRoundStartTime(Date.now())
    
    // Randomly select a drawer from all players
    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)]
    actions.setCurrentDrawer(randomPlayer.id)
    actions.setIsDrawer(randomPlayer.id === 'player1')
    
    // Add welcome message
    const welcomeMessage: GameMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: `🎨 ${randomPlayer.name} is drawing now!`,
      timestamp: Date.now()
    }
    actions.addMessage(welcomeMessage)
  }, [gameSettings, allPlayers, actions])

  // Handle player guess
  const handleGuess = useCallback((guess: string, playerId: string = 'player1') => {
    if (!state.currentWord) return false
    
    const isCorrect = guess.toLowerCase() === state.currentWord.toLowerCase()
    
    if (isCorrect && !state.correctGuesses.includes(playerId)) {
      // Calculate points based on order
      const guessOrder = state.correctGuesses.length + 1
      const basePoints = 100
      const points = Math.max(10, basePoints - (guessOrder - 1) * 20)
      
      // Update scores
      const newScores = {
        ...state.scores,
        [playerId]: (state.scores[playerId] || 0) + points
      }
      actions.updateScores(newScores)
      actions.addCorrectGuess(playerId)
      
      // Add success message
      const player = allPlayers.find(p => p.id === playerId)
      const successMessage: GameMessage = {
        id: Date.now().toString(),
        userId: playerId,
        userName: player?.name || 'Unknown',
        message: `🎉 Correct! "${state.currentWord}" (+${points} points)`,
        timestamp: Date.now()
      }
      actions.addMessage(successMessage)
      
      return true
    } else {
      // Add regular message
      const player = allPlayers.find(p => p.id === playerId)
      const message: GameMessage = {
        id: Date.now().toString(),
        userId: playerId,
        userName: player?.name || 'Unknown',
        message: guess,
        timestamp: Date.now()
      }
      actions.addMessage(message)
      return false
    }
  }, [state.currentWord, state.correctGuesses, state.scores, allPlayers, actions])

  // Timer effect
  useEffect(() => {
    if (!state.roundStartTime || !gameSettings) return
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - state.roundStartTime
      const remaining = Math.max(0, Math.ceil((gameSettings.roundTime * 1000 - elapsed) / 1000))
      
      actions.setTimeLeft(remaining)
      
      if (remaining <= 0) {
        // Round ended
        if (state.currentRound < state.totalRounds) {
          actions.setCurrentRound(state.currentRound + 1)
          startNewRound()
        } else {
          // Game ended
          alert('Game finished! Final scores will be displayed.')
        }
      }
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state.roundStartTime, gameSettings, state.currentRound, state.totalRounds, actions, startNewRound])

  // AI behavior simulation
  useEffect(() => {
    if (!state.currentWord || state.isDrawer || state.correctGuesses.length >= allPlayers.length - 1) {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current)
        aiIntervalRef.current = null
      }
      return
    }
    
    aiIntervalRef.current = setInterval(() => {
      // Random chance for AI to make a guess or send a message
      if (Math.random() < 0.3) { // 30% chance every few seconds
        const aiPlayers = allPlayers.filter(p => p.isAI && p.id !== state.currentDrawerId)
        if (aiPlayers.length > 0) {
          const randomAI = aiPlayers[Math.floor(Math.random() * aiPlayers.length)]
          
          if (Math.random() < 0.7) { // 70% chance to guess, 30% to chat
            // AI makes a guess
            const guess = simulateAIGuess(state.currentWord, 'medium')
            const isCorrect = handleGuess(guess, randomAI.id)
            
            if (!isCorrect) {
              // AI made a wrong guess - already handled in handleGuess
            }
          } else {
            // AI sends a chat message
            const chatMessage: GameMessage = {
              id: Date.now().toString(),
              userId: randomAI.id,
              userName: randomAI.name,
              message: simulateAIMessage(),
              timestamp: Date.now()
            }
            actions.addMessage(chatMessage)
          }
        }
      }
    }, 3000) // Check every 3 seconds

    return () => {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current)
        aiIntervalRef.current = null
      }
    }
  }, [state.currentWord, state.isDrawer, state.correctGuesses, allPlayers, state.currentDrawerId, actions, handleGuess])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current)
      }
    }
  }, [])

  return {
    startNewRound,
    handleGuess
  }
} 