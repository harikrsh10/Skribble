# WebSocket Server Setup Guide

This guide will help you set up a WebSocket server for real multiplayer functionality in your drawing game.

## Option 1: Simple Node.js WebSocket Server

### 1. Create a new directory for the server
```bash
mkdir pictior-server
cd pictior-server
npm init -y
```

### 2. Install dependencies
```bash
npm install ws express cors
npm install --save-dev @types/ws @types/express @types/cors nodemon
```

### 3. Create server.js
```javascript
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Game state storage
const rooms = new Map();
const players = new Map();

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const roomId = req.url.split('/').pop();
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`Player ${playerId} connected to room ${roomId}`);
  
  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      players: new Map(),
      gameState: {
        currentWord: '',
        timeLeft: 60,
        currentDrawer: null,
        scores: {},
        strokes: [],
        messages: [],
        currentRound: 1,
        totalRounds: 5,
        roundStartTime: 0,
        correctGuesses: [],
        gameStatus: 'waiting'
      }
    });
  }
  
  const room = rooms.get(roomId);
  players.set(playerId, { ws, roomId });
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(roomId, playerId, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    handlePlayerLeave(roomId, playerId);
    players.delete(playerId);
  });
});

function handleMessage(roomId, playerId, message) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  switch (message.type) {
    case 'join':
      // Add player to room
      room.players.set(playerId, {
        id: playerId,
        name: message.userName,
        avatar: message.data.avatar,
        isOnline: true,
        isDrawer: false,
        score: 0,
        joinedAt: message.data.joinedAt
      });
      
      // Broadcast player joined
      broadcastToRoom(roomId, {
        id: Date.now().toString(),
        type: 'join',
        userId: playerId,
        userName: message.userName,
        message: `${message.userName} joined the game`,
        data: message.data,
        timestamp: Date.now()
      });
      
      // Send current game state to new player
      sendToPlayer(playerId, {
        id: Date.now().toString(),
        type: 'game_state',
        userId: 'system',
        userName: 'System',
        message: 'game_state',
        data: room.gameState,
        timestamp: Date.now()
      });
      
      // Update player list
      updatePlayerList(roomId);
      break;
      
    case 'chat':
      // Broadcast chat message
      broadcastToRoom(roomId, message);
      break;
      
    case 'guess':
      // Handle guess
      handleGuess(roomId, playerId, message);
      break;
      
    case 'stroke_update':
      // Update strokes and broadcast
      room.gameState.strokes = message.data.strokes;
      broadcastToRoom(roomId, message, [playerId]); // Don't send back to sender
      break;
      
    case 'heartbeat':
      // Acknowledge heartbeat
      sendToPlayer(playerId, {
        id: Date.now().toString(),
        type: 'heartbeat',
        userId: 'system',
        userName: 'System',
        message: 'heartbeat',
        data: { timestamp: Date.now() },
        timestamp: Date.now()
      });
      break;
  }
}

function handleGuess(roomId, playerId, message) {
  const room = rooms.get(roomId);
  if (!room || !room.gameState.currentWord) return;
  
  const guess = message.data.guess;
  const isCorrect = guess.toLowerCase() === room.gameState.currentWord.toLowerCase();
  
  if (isCorrect && !room.gameState.correctGuesses.includes(playerId)) {
    // Calculate points
    const guessOrder = room.gameState.correctGuesses.length + 1;
    const points = Math.max(10, 100 - (guessOrder - 1) * 20);
    
    // Update scores
    room.gameState.scores[playerId] = (room.gameState.scores[playerId] || 0) + points;
    room.gameState.correctGuesses.push(playerId);
    
    // Broadcast success message
    const successMessage = {
      id: Date.now().toString(),
      type: 'guess',
      userId: playerId,
      userName: message.userName,
      message: `🎉 Correct! "${room.gameState.currentWord}" (+${points} points)`,
      data: { guess, isCorrect: true, points },
      timestamp: Date.now()
    };
    
    broadcastToRoom(roomId, successMessage);
  } else {
    // Broadcast wrong guess
    broadcastToRoom(roomId, message);
  }
}

function handlePlayerLeave(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const player = room.players.get(playerId);
  if (player) {
    // Broadcast player left
    broadcastToRoom(roomId, {
      id: Date.now().toString(),
      type: 'leave',
      userId: playerId,
      userName: player.name,
      message: `${player.name} left the game`,
      data: {},
      timestamp: Date.now()
    });
    
    room.players.delete(playerId);
    updatePlayerList(roomId);
  }
}

function updatePlayerList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const playerList = Array.from(room.players.values());
  
  broadcastToRoom(roomId, {
    id: Date.now().toString(),
    type: 'player_update',
    userId: 'system',
    userName: 'System',
    message: 'player_update',
    data: { players: playerList },
    timestamp: Date.now()
  });
}

function broadcastToRoom(roomId, message, excludePlayers = []) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.players.forEach((player, playerId) => {
    if (!excludePlayers.includes(playerId)) {
      sendToPlayer(playerId, message);
    }
  });
}

function sendToPlayer(playerId, message) {
  const player = players.get(playerId);
  if (player && player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(message));
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, players: players.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

### 4. Add scripts to package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 5. Run the server
```bash
npm run dev
```

## Option 2: Using a Cloud Service

### Firebase Realtime Database
1. Set up Firebase project
2. Use Firebase Realtime Database for real-time updates
3. Update WebSocket URL to use Firebase

### Socket.io Cloud
1. Use Socket.io cloud service
2. Deploy to Heroku, Railway, or similar
3. Update client to connect to cloud URL

## Option 3: Deploy to Vercel (Serverless)

Create `api/websocket.js` in your Next.js project:

```javascript
import { Server } from 'ws';

const wss = new Server({ port: 3001 });

wss.on('connection', (ws) => {
  // WebSocket logic here
});

export default function handler(req, res) {
  res.status(200).json({ message: 'WebSocket server running' });
}
```

## Environment Variables

Add to your `.env.local`:
```
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

## Testing

1. Start the WebSocket server
2. Open your game in multiple browser tabs
3. Test real-time drawing and chat
4. Verify player connections and disconnections

## Production Deployment

1. Deploy WebSocket server to a cloud provider
2. Update WebSocket URL in client code
3. Set up SSL certificates for WSS
4. Configure load balancing if needed

## Security Considerations

1. Add authentication to WebSocket connections
2. Validate all incoming messages
3. Rate limit message sending
4. Sanitize user inputs
5. Add room access controls 