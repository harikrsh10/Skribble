'use client'

import { useState, useEffect } from 'react'
import { useSelf, useOthers, useStorage, useMutation } from '@/lib/liveblocks'
import EnhancedDrawingCanvas from './EnhancedDrawingCanvas'
import WordGuessing from './WordGuessing'
import ChatBox from './ChatBox'
import Scoreboard from './Scoreboard'
import GameInfo from './GameInfo'
import { getRandomWord } from '@/lib/words'

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
  const self = useSelf()
  const others = useOthers()
  const storage = useStorage()
  
  const game = storage?.game
  const canvas = storage?.canvas
  
  const [guess, setGuess] = useState('')
  const [timeLeft, setTimeLeft] = useState(game?.timeLeft || 60)
  const [currentWord, setCurrentWord] = useState(game?.currentWord || '')
  const [currentDrawer, setCurrentDrawer] = useState<string | null>(game?.isDrawer ? self?.id : null)
  const [scores, setScores] = useState<Record<string, number>>(game?.scores || {})
  const [messages, setMessages] = useState<any[]>(game?.messages || [])
  const [strokes, setStrokes] = useState<Stroke[]>(canvas?.strokes || [])
  const [currentRound, setCurrentRound] = useState(game?.currentRound || 1)
  const [totalRounds, setTotalRounds] = useState(game?.totalRounds || 5)
  const [correctGuesses, setCorrectGuesses] = useState<string[]>(game?.correctGuesses || [])

  const updateGame = useMutation((updates: any) => {
    if (!storage) return
    storage.set('game', { ...game, ...updates })
  }, [storage, game])

  const updateCanvas = useMutation((updates: any) => {
    if (!storage) return
    storage.set('canvas', { ...canvas, ...updates })
  }, [storage, canvas])

  const startNewRound = useMutation(() => {
    if (!self || !others) return
    
    const allPlayers = [self, ...others]
    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)]
    const gameSettings = game?.gameSettings
    
    if (!gameSettings) return
    
    const newWord = getRandomWord(gameSettings.selectedCategories, gameSettings.allowAdultWords)
    
    setCurrentWord(newWord)
    setCurrentDrawer(randomPlayer.id)
    setStrokes([])
    setCorrectGuesses([])
    setTimeLeft(gameSettings.roundTime)
    
    // Update storage
    updateGame({
      currentWord: newWord,
      isDrawer: randomPlayer.id === self.id,
      roundStartTime: Date.now(),
      correctGuesses: []
    })
    
    updateCanvas({ strokes: [] })
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: `🎨 ${randomPlayer.info?.name} is drawing now!`,
      timestamp: Date.now()
    }
    
    const newMessages = [...messages, welcomeMessage]
    setMessages(newMessages)
    updateGame({ messages: newMessages })
  }, [self, others, game, messages, updateGame, updateCanvas])

  const handleGuess = useMutation(() => {
    if (!guess.trim() || !currentWord || !self) return
    
    const isCorrect = guess.trim().toLowerCase() === currentWord.toLowerCase()
    
    if (isCorrect && !correctGuesses.includes(self.id)) {
      // Calculate points based on order
      const guessOrder = correctGuesses.length + 1
      const basePoints = 100
      const points = Math.max(10, basePoints - (guessOrder - 1) * 20)
      
      // Update scores
      const newScore = (scores[self.id] || 0) + points
      const newScores = { ...scores, [self.id]: newScore }
      setScores(newScores)
      
      // Add to correct guesses
      const newCorrectGuesses = [...correctGuesses, self.id]
      setCorrectGuesses(newCorrectGuesses)
      
      // Add success message
      const successMessage = {
        id: Date.now().toString(),
        userId: self.id,
        userName: self.info?.name || 'You',
        message: `🎉 Correct! "${currentWord}" (+${points} points)`,
        timestamp: Date.now()
      }
      
      const newMessages = [...messages, successMessage]
      setMessages(newMessages)
      
      // Update storage
      updateGame({ 
        scores: newScores, 
        correctGuesses: newCorrectGuesses,
        messages: newMessages
      })
      
      // Check if round should end
      if (newCorrectGuesses.length >= [self, ...others].length - 1) {
        setTimeout(() => {
          if (currentRound < totalRounds) {
            setCurrentRound(prev => prev + 1)
            updateGame({ currentRound: currentRound + 1 })
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
        userId: self.id,
        userName: self.info?.name || 'You',
        message: guess.trim(),
        timestamp: Date.now()
      }
      
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)
      updateGame({ messages: newMessages })
    }
    
    setGuess('')
  }, [guess, self, currentWord, scores, correctGuesses, messages, currentRound, totalRounds, others, updateGame, startNewRound])

  const handleSendMessage = useMutation((message: string) => {
    if (!self) return
    
    const newMessage = {
      id: Date.now().toString(),
      userId: self.id,
      userName: self.info?.name || 'You',
      message: message,
      timestamp: Date.now()
    }
    
    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    updateGame({ messages: newMessages })
  }, [self, messages, updateGame])

  const handleStrokesChange = useMutation((newStrokes: Stroke[]) => {
    setStrokes(newStrokes)
    updateCanvas({ strokes: newStrokes })
  }, [updateCanvas])

  // Timer effect
  useEffect(() => {
    if (!game?.roundStartTime) return
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - game.roundStartTime
      const remaining = Math.max(0, Math.ceil((game.timeLeft * 1000 - elapsed) / 1000))
      
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        if (currentRound < totalRounds) {
          setCurrentRound(prev => prev + 1)
          updateGame({ currentRound: currentRound + 1 })
          startNewRound()
        } else {
          alert('Game finished! Final scores will be displayed.')
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [game?.roundStartTime, game?.timeLeft, currentRound, totalRounds, updateGame, startNewRound])

  // Start first round
  useEffect(() => {
    if (game?.gameSettings && !currentWord) {
      startNewRound()
    }
  }, [game?.gameSettings, currentWord, startNewRound])

  const isCurrentDrawer = self?.id === currentDrawer
  const allPlayers = [self, ...others].filter(Boolean)

  if (!self) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">Connecting...</div>
          <div className="text-gray-600">Please wait while we connect to the game.</div>
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
              roomId="live"
              currentWord={isCurrentDrawer ? currentWord : ''}
              timeLeft={timeLeft}
              isDrawer={isCurrentDrawer}
              currentRound={currentRound}
              totalRounds={totalRounds}
            />
            
            <EnhancedDrawingCanvas 
              isDrawer={isCurrentDrawer}
              strokes={strokes}
              onStrokesChange={handleStrokesChange}
            />
          </div>
          
          {/* Right sidebar - Guessing section */}
          <div className="space-y-4">
            <WordGuessing
              currentWord={currentWord}
              onGuess={handleGuess}
              isDrawer={isCurrentDrawer}
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
            currentUserId={self.id}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
} 