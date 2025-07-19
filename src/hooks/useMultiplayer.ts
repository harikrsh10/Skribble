import { useState, useEffect, useCallback, useRef } from 'react'
import { Player, GameMessage, GameState } from '@/types/game'

export interface GameSettings {
  hostName: string
  hostAvatar: string
  selectedCategories: string[]
  allowAdultWords: boolean
  roundTime: number
  totalRounds: number
}

export interface MultiplayerState {
  isConnected: boolean
  isConnecting: boolean
  players: Player[]
  messages: GameMessage[]
  gameState: GameState | null
  roomInfo: any
  error: string | null
}

export function useMultiplayer(roomId: string, isHost: boolean = false) {
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    isConnecting: false,
    players: [],
    messages: [],
    gameState: null,
    roomInfo: null,
    error: null
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const wsServerUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3002'
      const wsUrl = `${wsServerUrl}/room/${roomId}`
      
      console.log(`Connecting to WebSocket: ${wsUrl}`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected successfully')
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: null 
        }))
        startHeartbeat()
      }

      ws.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data)
          console.log('Received message:', message)
          
          switch (message.type) {
            case 'player_update':
              if (message.data?.players) {
                setState(prev => ({ ...prev, players: message.data.players }))
              }
              break
              
            case 'room_info':
              setState(prev => ({ ...prev, roomInfo: message.data }))
              break
              
            case 'game_state':
              setState(prev => ({ ...prev, gameState: message.data }))
              break
              
            case 'join':
            case 'leave':
            case 'chat':
            case 'guess':
              setState(prev => ({ 
                ...prev, 
                messages: [...prev.messages, message] 
              }))
              break
              
            case 'heartbeat':
              // Heartbeat acknowledged
              break
              
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isConnecting: false 
        }))
        stopHeartbeat()
        
        // Attempt to reconnect if not a clean close
        if (!event.wasClean && event.code !== 1000) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setState(prev => ({ 
          ...prev, 
          error: 'Connection failed',
          isConnecting: false 
        }))
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to connect',
        isConnecting: false 
      }))
    }
  }, [roomId])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    stopHeartbeat()
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    
    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isConnecting: false 
    }))
  }, [])

  // Send message to server
  const sendMessage = useCallback((message: Omit<GameMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: Date.now()
      }
      wsRef.current.send(JSON.stringify(fullMessage))
      return true
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
      return false
    }
  }, [])

  // Join room
  const joinRoom = useCallback((playerName: string, playerAvatar: string) => {
    return sendMessage({
      id: Date.now().toString(),
      type: 'join_room',
      userId: `player_${Date.now()}`,
      userName: playerName,
      message: `${playerName} joined the room`,
      data: {
        roomId,
        playerName,
        playerAvatar
      }
    })
  }, [sendMessage, roomId])

  // Update player info
  const updatePlayer = useCallback((playerName?: string, playerAvatar?: string) => {
    const updateData: any = {}
    if (playerName) updateData.playerName = playerName
    if (playerAvatar) updateData.playerAvatar = playerAvatar
    
    return sendMessage({
      id: Date.now().toString(),
      type: 'update_player',
      userId: 'current',
      userName: 'Player',
      message: 'player_update',
      data: updateData
    })
  }, [sendMessage])

  // Start game (host only)
  const startGame = useCallback((settings: GameSettings) => {
    if (!isHost) {
      console.warn('Only host can start the game')
      return false
    }
    
    return sendMessage({
      id: Date.now().toString(),
      type: 'start_game',
      userId: 'host',
      userName: settings.hostName,
      message: 'Game started',
      data: settings
    })
  }, [sendMessage, isHost])

  // Send chat message
  const sendChat = useCallback((message: string) => {
    return sendMessage({
      id: Date.now().toString(),
      type: 'chat',
      userId: 'current',
      userName: 'Player',
      message: message,
      data: { message }
    })
  }, [sendMessage])

  // Send guess
  const sendGuess = useCallback((guess: string) => {
    return sendMessage({
      id: Date.now().toString(),
      type: 'guess',
      userId: 'current',
      userName: 'Player',
      message: guess,
      data: { guess }
    })
  }, [sendMessage])

  // Send stroke update
  const sendStrokeUpdate = useCallback((strokes: any[]) => {
    return sendMessage({
      id: Date.now().toString(),
      type: 'stroke_update',
      userId: 'current',
      userName: 'Player',
      message: 'stroke_update',
      data: { strokes }
    })
  }, [sendMessage])

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({
          id: Date.now().toString(),
          type: 'heartbeat',
          userId: 'current',
          userName: 'Player',
          message: 'heartbeat',
          data: { timestamp: Date.now() }
        })
      }
    }, 30000) // Every 30 seconds
  }, [sendMessage])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Reconnection logic
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...')
      connect()
    }, 2000)
  }, [connect])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    joinRoom,
    updatePlayer,
    startGame,
    sendChat,
    sendGuess,
    sendStrokeUpdate
  }
} 