import { useEffect, useRef, useCallback, useState } from 'react'
import { GameWebSocket, GameMessage, Player, GameState } from '@/lib/websocket'
import { GameSettings } from '@/types/game'

interface UseMultiplayerProps {
  roomId: string
  gameSettings: GameSettings | null
  onGameStateUpdate: (state: Partial<GameState>) => void
  onPlayerUpdate: (players: Player[]) => void
  onMessageReceived: (message: GameMessage) => void
}

export function useMultiplayer({
  roomId,
  gameSettings,
  onGameStateUpdate,
  onPlayerUpdate,
  onMessageReceived
}: UseMultiplayerProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const wsRef = useRef<GameWebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    if (!gameSettings) return

    const userId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const userName = gameSettings.hostName
    const userAvatar = gameSettings.hostAvatar

    const ws = new GameWebSocket(roomId, userId, userName, userAvatar)
    wsRef.current = ws

    // Set up message handlers
    ws.onMessage((message: GameMessage) => {
      console.log('Received message:', message)
      
      switch (message.type) {
        case 'game_state':
          onGameStateUpdate(message.data)
          break
          
        case 'player_update':
          setPlayers(message.data.players || [])
          onPlayerUpdate(message.data.players || [])
          break
          
        case 'join':
          // Handle new player joining
          if (message.userId !== userId) {
            setPlayers(prev => {
              const newPlayer: Player = {
                id: message.userId,
                name: message.userName,
                avatar: message.data.avatar,
                isOnline: true,
                isDrawer: false,
                score: 0,
                joinedAt: message.data.joinedAt
              }
              return [...prev.filter(p => p.id !== message.userId), newPlayer]
            })
          }
          break
          
        case 'leave':
          // Handle player leaving
          setPlayers(prev => prev.filter(p => p.id !== message.userId))
          break
          
        case 'chat':
        case 'guess':
        case 'stroke_update':
          onMessageReceived(message)
          break
          
        case 'heartbeat':
          // Handle heartbeat - just acknowledge
          break
          
        default:
          console.log('Unhandled message type:', message.type)
      }
    })

    // Connect to WebSocket
    ws.connect()
    
    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      const connected = ws.getConnectionStatus()
      setIsConnected(connected)
      
      if (!connected && !connectionError) {
        setConnectionError('Connection lost. Attempting to reconnect...')
      } else if (connected && connectionError) {
        setConnectionError(null)
      }
    }, 1000)

    return () => {
      clearInterval(connectionCheck)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      ws.disconnect()
    }
  }, [roomId, gameSettings, onGameStateUpdate, onPlayerUpdate, onMessageReceived])

  // Send guess
  const sendGuess = useCallback((guess: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendGuess(guess)
    }
  }, [isConnected])

  // Send chat message
  const sendChat = useCallback((message: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendChat(message)
    }
  }, [isConnected])

  // Send stroke update
  const sendStrokeUpdate = useCallback((strokes: any[]) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendStrokeUpdate(strokes)
    }
  }, [isConnected])

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current.connect()
        }
      }, 1000)
    }
  }, [])

  return {
    isConnected,
    connectionError,
    players,
    sendGuess,
    sendChat,
    sendStrokeUpdate,
    reconnect
  }
} 