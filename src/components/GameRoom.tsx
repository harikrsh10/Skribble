'use client'

import { useEffect, useCallback } from 'react'
import EnhancedDrawingCanvas from './EnhancedDrawingCanvas'
import WordGuessing from './WordGuessing'
import ChatBox from './ChatBox'
import Scoreboard from './Scoreboard'
import GameInfo from './GameInfo'
import { useGameState } from '@/hooks/useGameState'
import { useGameLogic } from '@/hooks/useGameLogic'
import { useGameInitialization } from '@/hooks/useGameInitialization'
import { useMultiplayer } from '@/hooks/useMultiplayer'
import { GameRoomProps } from '@/types/game'
import { GameMessage, Player, GameState } from '@/types/game'
import { createSystemMessage, createPlayerMessage } from '@/utils/gameUtils'

export default function GameRoom({ roomId }: GameRoomProps) {
  // Initialize game state and settings
  const { gameSettings, isLoading } = useGameInitialization()
  
  // Game state management
  const { state, actions } = useGameState()
  
  // Multiplayer functionality - using new centralized hook
  const {
    isConnected,
    isConnecting,
    players,
    messages,
    gameState,
    error,
    sendGuess,
    sendChat,
    sendStrokeUpdate
  } = useMultiplayer(roomId, false) // false = not host (participants)

  // Update local state when server state changes
  useEffect(() => {
    if (gameState) {
      if (gameState.currentWord !== undefined) actions.setCurrentWord(gameState.currentWord)
      if (gameState.timeLeft !== undefined) actions.setTimeLeft(gameState.timeLeft)
      if (gameState.currentDrawer !== undefined) {
        actions.setCurrentDrawer(gameState.currentDrawer || '')
        actions.setIsDrawer(gameState.currentDrawer === 'player1')
      }
      if (gameState.scores !== undefined) actions.updateScores(gameState.scores)
      if (gameState.strokes !== undefined) actions.setStrokes(gameState.strokes)
      if (gameState.currentRound !== undefined) actions.setCurrentRound(gameState.currentRound)
      if (gameState.roundStartTime !== undefined) actions.setRoundStartTime(gameState.roundStartTime)
      if (gameState.correctGuesses !== undefined) {
        gameState.correctGuesses.forEach(playerId => actions.addCorrectGuess(playerId))
      }
    }
  }, [gameState, actions])

  // Update scores from player list
  useEffect(() => {
    if (players.length > 0) {
      const newScores: Record<string, number> = {}
      players.forEach(player => {
        newScores[player.id] = player.score
      })
      actions.updateScores(newScores)
    }
  }, [players, actions])

  // Handle incoming messages
  useEffect(() => {
    messages.forEach(message => {
      switch (message.type) {
        case 'chat':
          actions.addMessage(message)
          break
          
        case 'guess':
          // Handle guess from other players
          if (message.data?.guess && state.currentWord) {
            const isCorrect = message.data.guess.toLowerCase() === state.currentWord.toLowerCase()
            if (isCorrect && !state.correctGuesses.includes(message.userId)) {
              // Player got it right
              const guessOrder = state.correctGuesses.length + 1
              const points = Math.max(10, 100 - (guessOrder - 1) * 20)
              
              // Update scores
              const newScores = { ...state.scores }
              newScores[message.userId] = (newScores[message.userId] || 0) + points
              actions.updateScores(newScores)
              actions.addCorrectGuess(message.userId)
              
              // Add success message
              const successMessage = createPlayerMessage(
                message.userId,
                message.userName,
                `🎉 Correct! "${state.currentWord}" (+${points} points)`
              )
              actions.addMessage(successMessage)
            } else {
              // Wrong guess
              actions.addMessage(message)
            }
          }
          break
          
        case 'stroke_update':
          // Update canvas strokes from other players
          if (message.data?.strokes && !state.isDrawer) {
            actions.setStrokes(message.data.strokes)
          }
          break
      }
    })
  }, [messages, state.currentWord, state.correctGuesses, state.scores, state.isDrawer, actions])

  // Game logic (simplified for multiplayer)
  const { startNewRound } = useGameLogic({
    gameSettings,
    allPlayers: players,
    state,
    actions
  })

  // Handle player guess
  const handlePlayerGuess = useCallback((guess: string) => {
    if (!state.currentWord || state.isDrawer) return
    
    const isCorrect = guess.toLowerCase() === state.currentWord.toLowerCase()
    
    if (isCorrect && !state.correctGuesses.includes('player1')) {
      // Calculate points
      const guessOrder = state.correctGuesses.length + 1
      const points = Math.max(10, 100 - (guessOrder - 1) * 20)
      
      // Update local scores
      const newScores = { ...state.scores }
      newScores['player1'] = (newScores['player1'] || 0) + points
      actions.updateScores(newScores)
      actions.addCorrectGuess('player1')
      
      // Add success message
      const successMessage = createPlayerMessage(
        'player1',
        'You',
        `🎉 Correct! "${state.currentWord}" (+${points} points)`
      )
      actions.addMessage(successMessage)
    } else {
      // Wrong guess
      const message = createPlayerMessage('player1', 'You', guess)
      actions.addMessage(message)
    }
    
    // Send guess to server
    sendGuess(guess)
  }, [state.currentWord, state.isDrawer, state.correctGuesses, state.scores, actions, sendGuess])

  // Handle chat message
  const handleSendMessage = useCallback((message: string) => {
    const chatMessage = createPlayerMessage('player1', 'You', message)
    actions.addMessage(chatMessage)
    sendChat(message)
  }, [actions, sendChat])

  // Handle strokes change
  const handleStrokesChange = useCallback((newStrokes: any[]) => {
    actions.setStrokes(newStrokes)
    if (state.isDrawer) {
      sendStrokeUpdate(newStrokes)
    }
  }, [actions, state.isDrawer, sendStrokeUpdate])

  // Start first round when game is ready
  useEffect(() => {
    if (gameSettings && !state.currentWord && isConnected) {
      startNewRound()
    }
  }, [gameSettings, state.currentWord, isConnected, startNewRound])

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-4">Connecting to game server...</div>
          {error && (
            <div className="text-red-600 mb-4">{error}</div>
          )}
          {isConnecting && (
            <div className="text-blue-600">Establishing connection...</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Connection status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Players: {players.length}
          </div>
        </div>

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
            players={players}
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