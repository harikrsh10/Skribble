// Real-time multiplayer WebSocket implementation

export interface GameMessage {
  id: string
  type: 'draw' | 'guess' | 'chat' | 'join' | 'leave' | 'round_start' | 'round_end' | 'stroke_update' | 'player_update' | 'game_state' | 'heartbeat'
  userId: string
  userName: string
  message: string
  data: any
  timestamp: number
}

export interface Player {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  isDrawer: boolean
  score: number
  joinedAt: number
}

export interface GameState {
  roomId: string
  currentWord: string
  timeLeft: number
  currentDrawer: string | null
  players: Player[]
  scores: Record<string, number>
  strokes: any[]
  messages: GameMessage[]
  currentRound: number
  totalRounds: number
  roundStartTime: number
  correctGuesses: string[]
  gameStatus: 'waiting' | 'playing' | 'finished'
  gameSettings: any
}

export class GameWebSocket {
  private ws: WebSocket | null = null
  private messageHandlers: ((message: GameMessage) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval: number = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnected = false

  constructor(
    private roomId: string, 
    private userId: string, 
    private userName: string,
    private userAvatar: string
  ) {}

  connect() {
    try {
      // Use environment variable for WebSocket server URL
      const wsServerUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3002'
      const wsUrl = `${wsServerUrl}/room/${this.roomId}`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('Connected to game server')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        
        // Send join message
        this.send({
          id: Date.now().toString(),
          type: 'join',
          userId: this.userId,
          userName: this.userName,
          message: `${this.userName} joined the game`,
          data: {
            avatar: this.userAvatar,
            joinedAt: Date.now()
          }
        })
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data)
          this.messageHandlers.forEach(handler => handler(message))
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }
      
      this.ws.onclose = (event) => {
        console.log('Disconnected from game server:', event.code, event.reason)
        this.isConnected = false
        this.stopHeartbeat()
        
        if (!event.wasClean) {
          this.attemptReconnect()
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      this.attemptReconnect()
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          id: Date.now().toString(),
          type: 'heartbeat',
          userId: this.userId,
          userName: this.userName,
          message: 'heartbeat',
          data: { timestamp: Date.now() }
        })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  send(message: Omit<GameMessage, 'timestamp'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: Date.now()
      }
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  sendGuess(guess: string) {
    this.send({
      id: Date.now().toString(),
      type: 'guess',
      userId: this.userId,
      userName: this.userName,
      message: guess,
      data: { guess }
    })
  }

  sendChat(message: string) {
    this.send({
      id: Date.now().toString(),
      type: 'chat',
      userId: this.userId,
      userName: this.userName,
      message: message,
      data: { message }
    })
  }

  sendStrokeUpdate(strokes: any[]) {
    this.send({
      id: Date.now().toString(),
      type: 'stroke_update',
      userId: this.userId,
      userName: this.userName,
      message: 'stroke_update',
      data: { strokes }
    })
  }

  onMessage(handler: (message: GameMessage) => void) {
    this.messageHandlers.push(handler)
  }

  removeMessageHandler(handler: (message: GameMessage) => void) {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Local fallback state for offline mode
export class LocalGameState {
  private static instance: LocalGameState
  private players: Map<string, Player> = new Map()
  private messages: GameMessage[] = []
  private strokes: any[] = []
  private currentWord = ''
  private currentDrawer = ''
  private timeLeft = 60

  static getInstance(): LocalGameState {
    if (!LocalGameState.instance) {
      LocalGameState.instance = new LocalGameState()
    }
    return LocalGameState.instance
  }

  addPlayer(userId: string, name: string, avatar: string) {
    this.players.set(userId, {
      id: userId,
      name,
      avatar,
      isOnline: true,
      isDrawer: false,
      score: 0,
      joinedAt: Date.now()
    })
  }

  removePlayer(userId: string) {
    this.players.delete(userId)
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  addMessage(message: GameMessage) {
    this.messages.push(message)
  }

  getMessages(): GameMessage[] {
    return this.messages
  }

  updateStrokes(strokes: any[]) {
    this.strokes = strokes
  }

  getStrokes(): any[] {
    return this.strokes
  }

  setCurrentWord(word: string) {
    this.currentWord = word
  }

  getCurrentWord(): string {
    return this.currentWord
  }

  setCurrentDrawer(drawerId: string) {
    this.currentDrawer = drawerId
  }

  getCurrentDrawer(): string {
    return this.currentDrawer
  }

  setTimeLeft(time: number) {
    this.timeLeft = time
  }

  getTimeLeft(): number {
    return this.timeLeft
  }

  updateGameState(state: Partial<GameState>) {
    if (state.currentWord) this.currentWord = state.currentWord
    if (state.timeLeft) this.timeLeft = state.timeLeft
    if (state.currentDrawer) this.currentDrawer = state.currentDrawer
    if (state.strokes) this.strokes = state.strokes
  }

  getGameState(): GameState | null {
    return {
      roomId: '',
      currentWord: this.currentWord,
      timeLeft: this.timeLeft,
      currentDrawer: this.currentDrawer,
      players: this.getPlayers(),
      scores: {},
      strokes: this.strokes,
      messages: this.messages,
      currentRound: 1,
      totalRounds: 5,
      roundStartTime: 0,
      correctGuesses: [],
      gameStatus: 'waiting',
      gameSettings: {}
    }
  }
} 