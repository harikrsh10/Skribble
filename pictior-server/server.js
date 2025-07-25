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
  // Extract room ID from URL path
  const urlParts = req.url.split('/');
  const roomId = urlParts[urlParts.length - 1];
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`Player ${playerId} connected to room ${roomId}`);
  console.log(`URL: ${req.url}, Room ID: ${roomId}`);
  
  // Validate room ID
  if (!roomId || roomId === '') {
    console.error('Invalid room ID:', roomId);
    ws.close(1008, 'Invalid room ID');
    return;
  }
  
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
  
  console.log(`Handling message type: ${message.type} from player: ${playerId}`);
  
  switch (message.type) {
    case 'join':
    case 'join_room':
      // Add player to room
      const playerData = message.type === 'join_room' ? message.data : message.data;
      const playerName = playerData.playerName || message.userName || 'Anonymous';
      const playerAvatar = playerData.playerAvatar || message.data?.avatar || '🐱';
      
      room.players.set(playerId, {
        id: playerId,
        name: playerName,
        avatar: playerAvatar,
        isOnline: true,
        isDrawer: false,
        score: 0,
        joinedAt: Date.now()
      });
      
      console.log(`Player ${playerName} joined room ${roomId}`);
      
      // Broadcast player joined
      broadcastToRoom(roomId, {
        id: Date.now().toString(),
        type: 'join',
        userId: playerId,
        userName: playerName,
        message: `${playerName} joined the game`,
        data: { playerName, playerAvatar },
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
      
    case 'update_player':
      // Update player name/avatar
      const player = room.players.get(playerId);
      if (player && message.data) {
        let updated = false;
        
        if (message.data.playerName) {
          player.name = message.data.playerName;
          updated = true;
          console.log(`Player ${playerId} updated name to: ${message.data.playerName}`);
        }
        if (message.data.playerAvatar) {
          player.avatar = message.data.playerAvatar;
          updated = true;
          console.log(`Player ${playerId} updated avatar to: ${message.data.playerAvatar}`);
        }
        
        if (updated) {
          updatePlayerList(roomId);
        }
      }
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
      
    case 'start_game':
      // Start the game with provided settings
      console.log(`Game started in room ${roomId} by ${message.userName}`);
      
      // Update game state
      room.gameState.gameStatus = 'playing';
      room.gameState.gameSettings = message.data;
      room.gameState.currentRound = 1;
      room.gameState.roundStartTime = Date.now();
      
      // Broadcast game start to all players
      broadcastToRoom(roomId, {
        id: Date.now().toString(),
        type: 'start_game',
        userId: playerId,
        userName: message.userName,
        message: 'Game started!',
        data: message.data,
        timestamp: Date.now()
      });
      
      // Send updated game state to all players
      broadcastToRoom(roomId, {
        id: Date.now().toString(),
        type: 'game_state',
        userId: 'system',
        userName: 'System',
        message: 'game_state',
        data: room.gameState,
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
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pictior WebSocket Server is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is responding!',
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

// Add error handling for server startup
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Pictior WebSocket server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🚀 Server ready for connections!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Process ID: ${process.pid}`);
}); 