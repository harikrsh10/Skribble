// Game Types and Interfaces

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  points: Point[]
  color: string
  width: number
  type: 'draw' | 'eraser' | 'shape'
  shape?: 'rectangle' | 'circle' | 'triangle'
  startPoint?: Point
}

export interface Player {
  id: string
  info: {
    name: string
    picture: string
  }
  isAI: boolean
  score: number
}

export interface GameMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: number
}

export interface GameState {
  currentWord: string
  timeLeft: number
  isDrawer: boolean
  messages: GameMessage[]
  scores: Record<string, number>
  strokes: Stroke[]
  currentRound: number
  totalRounds: number
  roundStartTime: number
  correctGuesses: string[]
  currentDrawerId: string
}

export interface GameSettings {
  hostName: string
  hostAvatar: string
  roundTime: number
  totalRounds: number
  selectedCategories: string[]
  allowAdultWords: boolean
}

export interface GameRoomProps {
  roomId: string
}

export type GameAction = 
  | { type: 'SET_CURRENT_WORD'; payload: string }
  | { type: 'SET_TIME_LEFT'; payload: number }
  | { type: 'SET_IS_DRAWER'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: GameMessage }
  | { type: 'UPDATE_SCORES'; payload: Record<string, number> }
  | { type: 'SET_STROKES'; payload: Stroke[] }
  | { type: 'SET_CURRENT_ROUND'; payload: number }
  | { type: 'SET_ROUND_START_TIME'; payload: number }
  | { type: 'ADD_CORRECT_GUESS'; payload: string }
  | { type: 'SET_CURRENT_DRAWER'; payload: string }
  | { type: 'RESET_ROUND' }
  | { type: 'RESET_GAME' } 