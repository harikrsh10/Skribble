'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@/types/game'
import { useMultiplayer, GameSettings } from '@/hooks/useMultiplayer'

const AVATARS = [
  '🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦄',
  '🦋', '🐞', '🦅', '🦉', '🐧', '🦕', '🦖', '🐢', '🦎', '🐍'
]

const WORD_CATEGORIES = [
  { id: 'animals', name: 'Animals', icon: '🦁' },
  { id: 'food', name: 'Food & Drinks', icon: '🍕' },
  { id: 'movies', name: 'Movies & TV', icon: '🎬' },
  { id: 'office', name: 'Office', icon: '💼' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'nature', name: 'Nature', icon: '🌲' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'buildings', name: 'Buildings', icon: '🏠' }
]

interface RoomSetupProps {
  roomId: string
  onStartGame: (settings: GameSettings) => void
  onCancel: () => void
}

export default function RoomSetup({ roomId, onStartGame, onCancel }: RoomSetupProps) {
  const [hostName, setHostName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['animals', 'food'])
  const [allowAdultWords, setAllowAdultWords] = useState(false)
  const [roundTime, setRoundTime] = useState(60)
  const [totalRounds, setTotalRounds] = useState(5)
  const [copied, setCopied] = useState(false)
  
  // Use centralized multiplayer hook
  const {
    isConnected,
    isConnecting,
    players,
    error,
    joinRoom,
    updatePlayer,
    startGame
  } = useMultiplayer(roomId, true) // true = is host

  const roomLink = `${window.location.origin}/room/${roomId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Auto-join room as host when connected
  useEffect(() => {
    if (isConnected) {
      console.log('Auto-joining room as host')
      joinRoom('Host', selectedAvatar)
    }
  }, [isConnected, joinRoom, selectedAvatar])

  // Update host info when name/avatar changes
  useEffect(() => {
    if (isConnected && hostName) {
      updatePlayer(hostName, undefined)
    }
  }, [isConnected, hostName, updatePlayer])

  useEffect(() => {
    if (isConnected && selectedAvatar) {
      updatePlayer(undefined, selectedAvatar)
    }
  }, [isConnected, selectedAvatar, updatePlayer])

  const handleStartGame = () => {
    if (!hostName.trim()) {
      alert('Please enter your name')
      return
    }
    if (selectedCategories.length === 0) {
      alert('Please select at least one word category')
      return
    }

    const settings: GameSettings = {
      hostName: hostName.trim(),
      hostAvatar: selectedAvatar,
      selectedCategories,
      allowAdultWords,
      roundTime,
      totalRounds
    }
    
    // Send start game message to server
    if (isConnected) {
      console.log('Starting game with settings:', settings)
      startGame(settings)
    }
    
    // Call the parent callback
    onStartGame(settings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Room Setup
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Settings */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Settings</h2>
              
              {/* Username Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
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
            </div>

            {/* Word Categories */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Word Categories</h2>
              <div className="grid grid-cols-2 gap-2">
                {WORD_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 18+ Filter */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="adultWords"
                checked={allowAdultWords}
                onChange={(e) => setAllowAdultWords(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="adultWords" className="text-sm text-gray-700">
                Allow adult content (18+)
              </label>
            </div>

            {/* Game Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Settings</h2>
              
              {/* Round Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time per Round: {roundTime} seconds
                </label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Total Rounds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rounds: {totalRounds}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            {isConnecting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 text-center">
                  🔄 Connecting to room...
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800 text-center">
                  ❌ {error}
                </div>
              </div>
            )}

            {isConnected && !isConnecting && !error && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800 text-center">
                  ✅ Connected to room!
                </div>
              </div>
            )}

            {/* Start Game Button */}
            <button
              onClick={handleStartGame}
              disabled={!isConnected || !hostName.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Start Game
            </button>

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Right Column - Room Info & Players */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Information</h2>
              
              {/* Room Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

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
                    <div className="text-sm">Share the link to invite friends!</div>
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