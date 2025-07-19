# 🚀 Deployment Guide - Share Room Link with Friends

## Current Issue
Your game is trying to connect to a local WebSocket server (`ws://localhost:3002`), which only works on your computer. Friends can't join because they can't access your local server.

## Solution: Deploy WebSocket Server to the Cloud

### Option 1: Deploy to Railway (Recommended - Free)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy WebSocket Server**
   ```bash
   # Navigate to server directory
   cd pictior-server
   
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Connect to Railway
   npx railway login
   npx railway init
   npx railway up
   ```

3. **Get Your Server URL**
   - Railway will give you a URL like: `https://your-app.railway.app`
   - Your WebSocket URL will be: `wss://your-app.railway.app`

### Option 2: Deploy to Render (Alternative - Free)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy WebSocket Server**
   - Connect your GitHub repository
   - Select the `pictior-server` directory
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Get Your Server URL**
   - Render will give you a URL like: `https://your-app.onrender.com`
   - Your WebSocket URL will be: `wss://your-app.onrender.com`

## Update Your Game Configuration

### For Vercel Deployment:

1. **Add Environment Variable in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_WEBSOCKET_URL` = `wss://your-server-url.com`

2. **Redeploy Your Game**
   - Push changes to GitHub
   - Vercel will automatically redeploy

### For Local Development:

1. **Create `.env.local` file** (if not exists):
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3002
   ```

2. **For production testing**:
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-server-url.com
   ```

## How to Share Room Link

### Step 1: Deploy WebSocket Server
Follow the deployment steps above to get your server URL.

### Step 2: Update Game Configuration
Set the environment variable in Vercel with your server URL.

### Step 3: Share Room Link
1. **Create a room** in your game
2. **Copy the room link** (e.g., `https://your-game.vercel.app/room/abc123`)
3. **Send to friends** via:
   - WhatsApp/Telegram
   - Email
   - Discord/Slack
   - Any messaging app

### Step 4: Friends Join
1. **Friends click the room link**
2. **They enter their name and choose avatar**
3. **They appear in your participants list**
4. **Start the game when ready!**

## Testing Locally

### Start Both Servers:
```bash
# Terminal 1: Start WebSocket server
cd pictior-server
node server.js

# Terminal 2: Start Next.js game
cd ..
npm run dev
```

### Test with Multiple Tabs:
1. Open `http://localhost:3000` in multiple browser tabs
2. Create a room in one tab
3. Copy the room link and open in other tabs
4. See real players join!

## Troubleshooting

### Connection Issues:
- **Check WebSocket server is running**: `http://localhost:3002/health`
- **Verify environment variables**: Check Vercel dashboard
- **Check browser console**: Look for WebSocket errors

### Deployment Issues:
- **Railway/Render logs**: Check deployment logs
- **Environment variables**: Ensure `NEXT_PUBLIC_WEBSOCKET_URL` is set
- **CORS issues**: Server should handle CORS automatically

### Room Link Issues:
- **Invalid room ID**: Generate new room
- **Server down**: Restart WebSocket server
- **Network issues**: Check internet connection

## Quick Start Commands

```bash
# Deploy to Railway
cd pictior-server
npx railway up

# Get server URL
npx railway status

# Update Vercel environment variable
# Go to Vercel dashboard and add:
# NEXT_PUBLIC_WEBSOCKET_URL = wss://your-railway-url

# Test locally
npm run dev
```

## Success Indicators

✅ **WebSocket server deployed** - Health check returns 200  
✅ **Environment variable set** - Game connects to cloud server  
✅ **Room link works** - Friends can join from different devices  
✅ **Real-time multiplayer** - Drawing and chat work between players  

Your game will be truly multiplayer once you complete these steps! 🎨✨ 