'use client'

import { useEffect } from 'react'
import EnhancedDrawingCanvas from './EnhancedDrawingCanvas'
import WordGuessing from './WordGuessing'
import ChatBox from './ChatBox'
import Scoreboard from './Scoreboard'
import GameInfo from './GameInfo'
import { useGameState } from '@/hooks/useGameState'
import { useGameLogic } from '@/hooks/useGameLogic'
import { useGameInitialization } from '@/hooks/useGameInitialization'
import { GameRoomProps } from '@/types/game'

export default function GameRoom({ roomId }: GameRoomProps) {
  // Initialize game state and players
  const { gameSettings, allPlayers, isLoading } = useGameInitialization()
  
  // Game state management
  const { state, actions } = useGameState()
  
  // Game logic and AI behavior
  const { startNewRound, handleGuess } = useGameLogic({
    gameSettings,
    allPlayers,
    state,
    actions
  })

  // Initialize scores when players are loaded
  useEffect(() => {
    if (allPlayers.length > 0 && Object.keys(state.scores).length === 0) {
      const initialScores: Record<string, number> = {}
      allPlayers.forEach(player => {
        initialScores[player.id] = player.score
      })
      actions.updateScores(initialScores)
    }
  }, [allPlayers, state.scores, actions])

  // Start first round when game is ready
  useEffect(() => {
    if (gameSettings && !state.currentWord) {
      startNewRound()
    }
  }, [gameSettings, state.currentWord, startNewRound])

  // Handle player guess
  const handlePlayerGuess = (guess: string) => {
    handleGuess(guess, 'player1')
  }

  // Handle chat message
  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      userId: 'player1',
      userName: 'You',
      message: message,
      timestamp: Date.now()
    }
    actions.addMessage(newMessage)
  }

  // Handle strokes change
  const handleStrokesChange = (newStrokes: any[]) => {
    actions.setStrokes(newStrokes)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">Loading game...</div>
          <div className="text-gray-600">Please wait while we set up your game.</div>
        </div>
      </div>
    )
  }

  if (!gameSettings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">No game settings found</div>
          <div className="text-gray-600">Please set up your game first.</div>
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
              currentWord={state.isDrawer ? state.currentWord : ''}
              timeLeft={state.timeLeft}
              isDrawer={state.isDrawer}
              currentRound={state.currentRound}
              totalRounds={state.totalRounds}
            />
            
            <EnhancedDrawingCanvas 
              isDrawer={state.isDrawer}
              strokes={state.strokes}
              onStrokesChange={handleStrokesChange}
            />
          </div>
          
          {/* Right sidebar - Guessing section */}
          <div className="space-y-4">
            <WordGuessing
              currentWord={state.currentWord}
              onGuess={handlePlayerGuess}
              isDrawer={state.isDrawer}
              timeLeft={state.timeLeft}
            />
          </div>
        </div>
        
        {/* Bottom section - Chat and Scoreboard */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Scoreboard 
            players={allPlayers}
            scores={state.scores}
          />
          <ChatBox 
            messages={state.messages}
            currentUserId="player1"
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
} 