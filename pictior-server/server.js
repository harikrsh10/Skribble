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
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    players: players.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    playerCount: room.players.size,
    gameStatus: room.gameState.gameStatus,
    currentRound: room.gameState.currentRound,
    totalRounds: room.gameState.totalRounds
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🎮 Pictior WebSocket server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
}); 