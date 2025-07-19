export interface GameMessage {
  type: 'draw' | 'guess' | 'chat' | 'join' | 'leave' | 'round_start' | 'round_end'
  userId: string
  userName: string
  data: any
  timestamp: number
}

export class GameWebSocket {
  private ws: WebSocket | null = null
  private messageHandlers: ((message: GameMessage) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(private roomId: string, private userId: string, private userName: string) {}

  connect() {
    try {
      // For development, use a local WebSocket server
      // In production, replace with your WebSocket server URL
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? `ws://localhost:3001/room/${this.roomId}`
        : `wss://your-websocket-server.com/room/${this.roomId}`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('Connected to game server')
        this.reconnectAttempts = 0
        
        // Send join message
        this.send({
          type: 'join',
          userId: this.userId,
          userName: this.userName,
          data: {},
          timestamp: Date.now()
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
      
      this.ws.onclose = () => {
        console.log('Disconnected from game server')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, 1000 * this.reconnectAttempts)
    }
  }

  send(message: { type: GameMessage['type']; userId: string; userName: string; data: any }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }))
    }
  }

  onMessage(handler: (message: GameMessage) => void) {
    this.messageHandlers.push(handler)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Simple in-memory game state for development
export class LocalGameState {
  private static instance: LocalGameState
  private players: Map<string, { name: string; score: number }> = new Map()
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

  addPlayer(userId: string, name: string) {
    this.players.set(userId, { name, score: 0 })
  }

  removePlayer(userId: string) {
    this.players.delete(userId)
  }

  getPlayers() {
    return Array.from(this.players.entries()).map(([id, player]) => ({
      id,
      name: player.name,
      score: player.score
    }))
  }

  addMessage(message: GameMessage) {
    this.messages.push(message)
  }

  getMessages() {
    return this.messages
  }

  updateStrokes(strokes: any[]) {
    this.strokes = strokes
  }

  getStrokes() {
    return this.strokes
  }

  setCurrentWord(word: string) {
    this.currentWord = word
  }

  getCurrentWord() {
    return this.currentWord
  }

  setCurrentDrawer(drawerId: string) {
    this.currentDrawer = drawerId
  }

  getCurrentDrawer() {
    return this.currentDrawer
  }

  setTimeLeft(time: number) {
    this.timeLeft = time
  }

  getTimeLeft() {
    return this.timeLeft
  }
} 