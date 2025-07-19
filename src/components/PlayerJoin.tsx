'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@/types/game'

const AVATARS = [
  '🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦄',
  '🦋', '🐞', '🦅', '🦉', '🐧', '🦕', '🦖', '🐢', '🦎', '🐍'
]

interface PlayerJoinProps {
  roomId: string
  onJoinRoom: (playerName: string, playerAvatar: string) => void
  onCancel: () => void
}

export default function PlayerJoin({ roomId, onJoinRoom, onCancel }: PlayerJoinProps) {
  const [playerName, setPlayerName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [roomInfo, setRoomInfo] = useState<any>(null)

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    onJoinRoom(playerName.trim(), selectedAvatar)
  }

  // Connect to WebSocket and listen for room updates
  useEffect(() => {
    setIsConnecting(true)
    
    // Create WebSocket connection to listen for room updates
    const wsServerUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://skribble-production-a394.up.railway.app'
    const wsUrl = `${wsServerUrl}/room/${roomId}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('Connected to room as player')
      setIsConnecting(false)
      
      // Send join room message
      ws.send(JSON.stringify({
        type: 'join_room',
        data: {
          roomId,
          playerName: playerName || 'Anonymous',
          playerAvatar: selectedAvatar
        }
      }))
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'player_update' && message.data.players) {
          setConnectedPlayers(message.data.players)
        } else if (message.type === 'room_info' && message.data) {
          setRoomInfo(message.data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnecting(false)
    }
    
    return () => {
      ws.close()
    }
  }, [roomId, playerName, selectedAvatar])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Join Room
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Settings */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Details</h2>
              
              {/* Username Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              </div>

              {/* Avatar Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                        selectedAvatar === avatar
                          ? 'border-blue-500 bg-blue-50 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || isConnecting}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Join Room'}
              </button>

              {/* Waiting Message */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800 text-center">
                  ⏳ Waiting for host to start the game...
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column - Room Info & Players */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Information</h2>
              
              {/* Room Code */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-lg">
                    {roomId}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(roomId)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Connected Players */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Players ({connectedPlayers.length})
                </h3>
                <div className="space-y-2">
                  {connectedPlayers.map((player, index) => (
                                         <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                       <span className="text-2xl">{player.avatar}</span>
                       <span className="font-medium">{player.name}</span>
                       {index === 0 && (
                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                           Host
                         </span>
                       )}
                     </div>
                  ))}
                  {connectedPlayers.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No players connected yet...
                    </div>
                  )}
                </div>
              </div>

              {/* Room Status */}
              {roomInfo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Game Settings</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>Rounds: {roomInfo.totalRounds}</div>
                    <div>Time per round: {roomInfo.roundTime}s</div>
                    <div>Categories: {roomInfo.selectedCategories?.join(', ') || 'All'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 