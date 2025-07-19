# Pictior WebSocket Server

Real-time WebSocket server for the Pictior multiplayer drawing game.

## Features

- 🎮 **Real-time multiplayer** drawing and guessing
- 💬 **Live chat** between players
- 🏆 **Score tracking** and leaderboards
- 🔄 **Automatic reconnection** handling
- 📊 **Health monitoring** endpoints
- 🛡️ **CORS enabled** for cross-origin requests

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Start Production Server
```bash
npm start
```

## Server Endpoints

### Health Check
```
GET http://localhost:3002/health
```
Returns server status and statistics.

### Room Information
```
GET http://localhost:3002/room/:roomId
```
Returns information about a specific game room.

## WebSocket Connection

Connect to the WebSocket server:
```
ws://localhost:3002/room/:roomId
```

Where `:roomId` is the unique identifier for your game room.

## Message Types

The server handles the following message types:

- `join` - Player joining the room
- `leave` - Player leaving the room
- `chat` - Chat messages
- `guess` - Word guesses
- `stroke_update` - Drawing strokes
- `heartbeat` - Connection keep-alive

## Environment Variables

- `PORT` - Server port (default: 3002)

## Development

The server uses nodemon for automatic restarting during development. Any changes to `server.js` will automatically restart the server.

## Production Deployment

1. Set the `PORT` environment variable
2. Run `npm start`
3. Ensure your firewall allows connections on the specified port

## Testing

1. Start the server: `npm run dev`
2. Open your game in multiple browser tabs
3. Test real-time drawing and chat functionality
4. Verify player connections and disconnections

## Troubleshooting

### Port Already in Use
If port 3002 is already in use, set a different port:
```bash
PORT=3003 npm run dev
```

### Connection Issues
- Check if the server is running
- Verify the WebSocket URL in your client
- Check browser console for connection errors

### CORS Issues
The server includes CORS headers, but if you're still having issues, you may need to configure your client to handle CORS properly. 