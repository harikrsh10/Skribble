'use client'

import { useState, useEffect } from 'react'
import EnhancedDrawingCanvas from './EnhancedDrawingCanvas'
import WordGuessing from './WordGuessing'
import ChatBox from './ChatBox'
import Scoreboard from './Scoreboard'
import GameInfo from './GameInfo'
import { getRandomWord } from '@/lib/words'
import { generateDummyPlayers, simulateAIGuess, simulateAIMessage, DummyPlayer } from '@/lib/dummyPlayers'
import { GameSettings } from './RoomSetup'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
  type: 'draw' | 'eraser' | 'shape'
  shape?: 'rectangle' | 'circle' | 'triangle'
  startPoint?: Point
}

interface GameRoomProps {
  roomId: string
}

export default function GameRoom({ roomId }: GameRoomProps) {
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [currentWord, setCurrentWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [isDrawer, setIsDrawer] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(5)
  const [roundStartTime, setRoundStartTime] = useState(0)
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([])
  const [dummyPlayers, setDummyPlayers] = useState<DummyPlayer[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [currentDrawerId, setCurrentDrawerId] = useState<string>('')

  // Load game settings from localStorage and initialize dummy players
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setGameSettings(settings)
      setTimeLeft(settings.roundTime)
      setTotalRounds(settings.totalRounds)
      
      // Generate dummy players
      const dummies = generateDummyPlayers(3) // 3 AI players
      setDummyPlayers(dummies)
      
      // Create all players array (host + dummies)
      const hostPlayer = {
        id: 'player1',
        info: { name: settings.hostName, picture: settings.hostAvatar },
        isAI: false,
        score: 0
      }
      
      const allPlayersArray = [hostPlayer, ...dummies.map(dp => ({
        id: dp.id,
        info: { name: dp.name, picture: dp.avatar },
        isAI: dp.isAI,
        score: dp.score
      }))]
      
      setAllPlayers(allPlayersArray)
      
      // Initialize scores
      const initialScores: Record<string, number> = {}
      allPlayersArray.forEach(player => {
        initialScores[player.id] = player.score
      })
      setScores(initialScores)
    }
  }, [])

  // Start new round
  const startNewRound = () => {
    if (!gameSettings || allPlayers.length === 0) return
    
    const newWord = getRandomWord(gameSettings.selectedCategories, gameSettings.allowAdultWords)
    setCurrentWord(newWord)
    setStrokes([])
    setCorrectGuesses([])
    setRoundStartTime(Date.now())
    
    // Randomly select a drawer from all players
    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)]
    setCurrentDrawerId(randomPlayer.id)
    setIsDrawer(randomPlayer.id === 'player1')
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: `🎨 ${randomPlayer.info.name} is drawing now!`,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, welcomeMessage])
  }

  // Timer effect
  useEffect(() => {
    if (!roundStartTime || !gameSettings) return
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - roundStartTime
      const remaining = Math.max(0, Math.ceil((gameSettings.roundTime * 1000 - elapsed) / 1000))
      
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        // Round ended
        if (currentRound < totalRounds) {
          setCurrentRound(prev => prev + 1)
          startNewRound()
        } else {
          // Game ended
          alert('Game finished! Final scores will be displayed.')
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [roundStartTime, gameSettings, currentRound, totalRounds])

  // AI behavior simulation
  useEffect(() => {
    if (!currentWord || isDrawer || correctGuesses.length >= allPlayers.length - 1) return
    
    // Simulate AI guesses and messages
    const aiInterval = setInterval(() => {
      // Random chance for AI to make a guess or send a message
      if (Math.random() < 0.3) { // 30% chance every few seconds
        const aiPlayers = allPlayers.filter(p => p.isAI && p.id !== currentDrawerId)
        if (aiPlayers.length > 0) {
          const randomAI = aiPlayers[Math.floor(Math.random() * aiPlayers.length)]
          
          if (Math.random() < 0.7) { // 70% chance to guess, 30% to chat
            // AI makes a guess
            const guess = simulateAIGuess(currentWord, 'medium')
            const isCorrect = guess.toLowerCase() === currentWord.toLowerCase()
            
            if (isCorrect && !correctGuesses.includes(randomAI.id)) {
              // AI got it right
              const guessOrder = correctGuesses.length + 1
              const basePoints = 100
              const points = Math.max(10, basePoints - (guessOrder - 1) * 20)
              
              setScores(prev => ({
                ...prev,
                [randomAI.id]: (prev[randomAI.id] || 0) + points
              }))
              
              setCorrectGuesses(prev => [...prev, randomAI.id])
              
              const successMessage = {
                id: Date.now().toString(),
                userId: randomAI.id,
                userName: randomAI.info.name,
                message: `🎉 Correct! "${currentWord}" (+${points} points)`,
                timestamp: Date.now()
              }
              setMessages(prev => [...prev, successMessage])
            } else {
              // AI made a wrong guess
              const guessMessage = {
                id: Date.now().toString(),
                userId: randomAI.id,
                userName: randomAI.info.name,
                message: guess,
                timestamp: Date.now()
              }
              setMessages(prev => [...prev, guessMessage])
            }
          } else {
            // AI sends a chat message
            const chatMessage = {
              id: Date.now().toString(),
              userId: randomAI.id,
              userName: randomAI.info.name,
              message: simulateAIMessage(),
              timestamp: Date.now()
            }
            setMessages(prev => [...prev, chatMessage])
          }
        }
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(aiInterval)
  }, [currentWord, isDrawer, correctGuesses, allPlayers, currentDrawerId])

  // Start first round
  useEffect(() => {
    if (gameSettings) {
      startNewRound()
    }
  }, [gameSettings])

  const handleGuess = (guess: string) => {
    if (!currentWord) return
    
    const isCorrect = guess.toLowerCase() === currentWord.toLowerCase()
    
    if (isCorrect && !correctGuesses.includes('player1')) {
      // Calculate points based on order (first gets highest points)
      const guessOrder = correctGuesses.length + 1
      const basePoints = 100
      const points = Math.max(10, basePoints - (guessOrder - 1) * 20) // First: 100, Second: 80, etc.
      
      // Update scores
      const newScore = (scores['player1'] || 0) + points
      setScores(prev => ({
        ...prev,
        'player1': newScore
      }))
      
      // Add to correct guesses
      setCorrectGuesses(prev => [...prev, 'player1'])
      
      // Add success message
      const newMessage = {
        id: Date.now().toString(),
        userId: 'player1',
        userName: 'You',
        message: `🎉 Correct! "${currentWord}" (+${points} points)`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, newMessage])
      
      // Check if all players have guessed correctly
      if (correctGuesses.length + 1 >= allPlayers.length - 1) { // All players except drawer
        // Round ends early
        setTimeout(() => {
          if (currentRound < totalRounds) {
            setCurrentRound(prev => prev + 1)
            startNewRound()
          } else {
            alert('Game finished! Final scores will be displayed.')
          }
        }, 2000)
      }
    } else {
      // Add regular message
      const newMessage = {
        id: Date.now().toString(),
        userId: 'player1',
        userName: 'You',
        message: guess,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, newMessage])
    }
  }

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      userId: 'player1',
      userName: 'You',
      message: message,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleStrokesChange = (newStrokes: Stroke[]) => {
    setStrokes(newStrokes)
  }

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-3 space-y-4">
            <GameInfo 
              roomId={roomId}
              currentWord={isDrawer ? currentWord : ''}
              timeLeft={timeLeft}
              isDrawer={isDrawer}
              currentRound={currentRound}
              totalRounds={totalRounds}
            />
            
            <EnhancedDrawingCanvas 
              isDrawer={isDrawer}
              strokes={strokes}
              onStrokesChange={handleStrokesChange}
            />
          </div>
          
          {/* Right sidebar - Guessing section */}
          <div className="space-y-4">
            <WordGuessing
              currentWord={currentWord}
              onGuess={handleGuess}
              isDrawer={isDrawer}
              timeLeft={timeLeft}
            />
          </div>
        </div>
        
        {/* Bottom section - Chat and Scoreboard */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Scoreboard 
            players={allPlayers}
            scores={scores}
          />
          <ChatBox 
            messages={messages}
            currentUserId="player1"
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
} 