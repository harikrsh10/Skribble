# Pictior - Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and word guessing game built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Real-time drawing** with multiple tools (pen, eraser, shapes)
- 🤖 **AI players** for realistic multiplayer experience
- 💬 **Live chat** during gameplay
- 🏆 **Score tracking** and leaderboard
- ⏱️ **Timer-based rounds** with automatic progression
- 🎯 **Word guessing** with hints and feedback
- 📱 **Responsive design** for all devices

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Drawing:** HTML5 Canvas with custom drawing tools
- **State Management:** React hooks and local state
- **Styling:** Tailwind CSS with responsive design
- **Deployment:** Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Game Rules

1. **Setup:** Choose game settings and create a room
2. **Drawing:** One player draws while others guess
3. **Scoring:** First correct guess gets 100 points, subsequent guesses get fewer points
4. **Rounds:** Multiple rounds with different drawers
5. **Winner:** Player with highest score at the end wins

## Latest Update

**Deployment Fix - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")**

Fixed build errors by removing Liveblocks dependencies and implementing a working dummy player system for immediate deployment.

---

Built with ❤️ using Next.js and TypeScript 