import { useReducer, useCallback } from 'react'
import { GameState, GameAction, GameMessage, Player } from '@/types/game'
import { getRandomWord } from '@/lib/words'

const initialState: GameState = {
  currentWord: '',
  timeLeft: 60,
  isDrawer: false,
  messages: [],
  scores: {},
  strokes: [],
  currentRound: 1,
  totalRounds: 5,
  roundStartTime: 0,
  correctGuesses: [],
  currentDrawerId: ''
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CURRENT_WORD':
      return { ...state, currentWord: action.payload }
    
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload }
    
    case 'SET_IS_DRAWER':
      return { ...state, isDrawer: action.payload }
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload]
      }
    
    case 'UPDATE_SCORES':
      return { ...state, scores: action.payload }
    
    case 'SET_STROKES':
      return { ...state, strokes: action.payload }
    
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload }
    
    case 'SET_ROUND_START_TIME':
      return { ...state, roundStartTime: action.payload }
    
    case 'ADD_CORRECT_GUESS':
      return { 
        ...state, 
        correctGuesses: [...state.correctGuesses, action.payload]
      }
    
    case 'SET_CURRENT_DRAWER':
      return { ...state, currentDrawerId: action.payload }
    
    case 'RESET_ROUND':
      return {
        ...state,
        currentWord: '',
        strokes: [],
        correctGuesses: [],
        roundStartTime: 0,
        timeLeft: 60
      }
    
    case 'RESET_GAME':
      return {
        ...initialState,
        currentRound: 1,
        totalRounds: state.totalRounds
      }
    
    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const setCurrentWord = useCallback((word: string) => {
    dispatch({ type: 'SET_CURRENT_WORD', payload: word })
  }, [])

  const setTimeLeft = useCallback((time: number) => {
    dispatch({ type: 'SET_TIME_LEFT', payload: time })
  }, [])

  const setIsDrawer = useCallback((isDrawer: boolean) => {
    dispatch({ type: 'SET_IS_DRAWER', payload: isDrawer })
  }, [])

  const addMessage = useCallback((message: GameMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message })
  }, [])

  const updateScores = useCallback((scores: Record<string, number>) => {
    dispatch({ type: 'UPDATE_SCORES', payload: scores })
  }, [])

  const setStrokes = useCallback((strokes: any[]) => {
    dispatch({ type: 'SET_STROKES', payload: strokes })
  }, [])

  const setCurrentRound = useCallback((round: number) => {
    dispatch({ type: 'SET_CURRENT_ROUND', payload: round })
  }, [])

  const setRoundStartTime = useCallback((time: number) => {
    dispatch({ type: 'SET_ROUND_START_TIME', payload: time })
  }, [])

  const addCorrectGuess = useCallback((playerId: string) => {
    dispatch({ type: 'ADD_CORRECT_GUESS', payload: playerId })
  }, [])

  const setCurrentDrawer = useCallback((drawerId: string) => {
    dispatch({ type: 'SET_CURRENT_DRAWER', payload: drawerId })
  }, [])

  const resetRound = useCallback(() => {
    dispatch({ type: 'RESET_ROUND' })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  return {
    state,
    actions: {
      setCurrentWord,
      setTimeLeft,
      setIsDrawer,
      addMessage,
      updateScores,
      setStrokes,
      setCurrentRound,
      setRoundStartTime,
      addCorrectGuess,
      setCurrentDrawer,
      resetRound,
      resetGame
    }
  }
} 