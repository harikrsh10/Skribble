// Game utility functions

import { Player, GameMessage } from '@/types/game'

/**
 * Calculate points for a correct guess based on order
 */
export function calculatePoints(guessOrder: number, basePoints: number = 100): number {
  return Math.max(10, basePoints - (guessOrder - 1) * 20)
}

/**
 * Create a system message
 */
export function createSystemMessage(message: string): GameMessage {
  return {
    id: Date.now().toString(),
    userId: 'system',
    userName: 'System',
    message,
    timestamp: Date.now()
  }
}

/**
 * Create a player message
 */
export function createPlayerMessage(
  playerId: string, 
  playerName: string, 
  message: string
): GameMessage {
  return {
    id: Date.now().toString(),
    userId: playerId,
    userName: playerName,
    message,
    timestamp: Date.now()
  }
}

/**
 * Create a success message for correct guess
 */
export function createSuccessMessage(
  playerId: string,
  playerName: string,
  word: string,
  points: number
): GameMessage {
  return createPlayerMessage(
    playerId,
    playerName,
    `🎉 Correct! "${word}" (+${points} points)`
  )
}

/**
 * Get random player from array
 */
export function getRandomPlayer(players: Player[]): Player | null {
  if (players.length === 0) return null
  return players[Math.floor(Math.random() * players.length)]
}

/**
 * Check if all players except drawer have guessed correctly
 */
export function allPlayersGuessed(
  correctGuesses: string[],
  allPlayers: Player[],
  currentDrawerId: string
): boolean {
  const guessingPlayers = allPlayers.filter(p => p.id !== currentDrawerId)
  return correctGuesses.length >= guessingPlayers.length
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Memoize function for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map()
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
} 