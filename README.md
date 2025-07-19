# Pictior - Real-time Drawing Game

A multiplayer drawing game built with Next.js and Liveblocks. Players take turns drawing words while others guess what they're drawing.

## Features

- 🎨 Real-time drawing canvas using HTML5 Canvas
- 👥 Multiplayer support with room-based gameplay
- 💬 Live chat system
- 🎯 Word guessing mechanics
- ⏱️ 60-second round timer
- 🏆 Scoreboard tracking
- 🎲 Random word selection from predefined list
- 📱 Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pictior
```

2. Install dependencies:
```bash
npm install
```

3. Set up Liveblocks (Optional for full multiplayer):
   - Sign up at [liveblocks.io](https://liveblocks.io)
   - Get your public API key
   - Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_public_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Create or Join a Room**: 
   - Click "Create New Room" to generate a room code
   - Or enter an existing room code to join

2. **Gameplay**:
   - One player is randomly selected as the drawer
   - The drawer sees a word they need to draw
   - Other players try to guess the word
   - Each round lasts 60 seconds
   - Correct guesses award 10 points
   - New rounds start automatically

3. **Drawing**:
   - Use your mouse to draw on the canvas
   - Only the current drawer can draw
   - Drawings are saved and shared in real-time

4. **Chat**:
   - Send messages to other players
   - Use the chat to coordinate or just have fun!

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page with room creation
│   └── room/
│       └── [roomId]/
│           └── page.tsx     # Game room page
├── components/              # React components
│   ├── DrawingCanvas.tsx    # Canvas drawing component
│   ├── ChatBox.tsx          # Chat functionality
│   ├── Scoreboard.tsx       # Player scores display
│   └── GameInfo.tsx         # Game status and info
└── lib/
    └── liveblocks.ts        # Liveblocks configuration
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Liveblocks** - Real-time collaboration platform
- **HTML5 Canvas** - Drawing functionality

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Multiplayer Features

The current version includes a working single-player demo. To enable full multiplayer:

1. Set up Liveblocks API key in `.env.local`
2. Uncomment and configure the Liveblocks integration in `src/lib/liveblocks.ts`
3. Update the room page to use the Liveblocks RoomProvider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Liveblocks for real-time collaboration tools
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling approach 