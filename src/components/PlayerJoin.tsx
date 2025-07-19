'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@/types/game'
import { useMultiplayer } from '@/hooks/useMultiplayer'

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
  const [hasJoined, setHasJoined] = useState(false)
  
  // Use centralized multiplayer hook
  const {
    isConnected,
    isConnecting,
    players,
    error,
    joinRoom,
    updatePlayer
  } = useMultiplayer(roomId, false) // false = not host

  // Auto-join room when connected
  useEffect(() => {
    if (isConnected && !hasJoined) {
      console.log('Auto-joining room as participant')
      joinRoom('Anonymous', selectedAvatar)
      setHasJoined(true)
    }
  }, [isConnected, hasJoined, joinRoom, selectedAvatar])

  const handleNameChange = (name: string) => {
    setPlayerName(name)
    
    // Update player info in localStorage
    localStorage.setItem('playerInfo', JSON.stringify({
      name: name,
      avatar: selectedAvatar,
      roomId
    }))
    
    // Send update to server
    updatePlayer(name, undefined)
  }

  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar)
    
    // Update player info in localStorage
    localStorage.setItem('playerInfo', JSON.stringify({
      name: playerName,
      avatar: avatar,
      roomId
    }))
    
    // Send update to server
    updatePlayer(undefined, avatar)
  }

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
                  onChange={(e) => handleNameChange(e.target.value)}
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
                      onClick={() => handleAvatarChange(avatar)}
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

              {/* Connection Status */}
              {isConnecting && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800 text-center">
                    🔄 Connecting to room...
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800 text-center">
                    ❌ {error}
                  </div>
                </div>
              )}

              {isConnected && !isConnecting && !error && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800 text-center">
                    ✅ Connected to room!
                  </div>
                </div>
              )}

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
                Leave Room
              </button>
            </div>
          </div>

          {/* Right Column - Room Info & Players */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Information</h2>
              
              {/* Room ID */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Room Code</div>
                <div className="text-lg font-mono font-semibold text-gray-800">{roomId}</div>
              </div>

              {/* Players List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Players ({players.length})
                </h3>
                
                {players.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">👥</div>
                    <div>No players yet</div>
                    <div className="text-sm">You'll be the first!</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl">{player.avatar}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {player.name}
                            {player.isDrawer && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Drawing
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Score: {player.score} • Joined {new Date(player.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          player.isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 