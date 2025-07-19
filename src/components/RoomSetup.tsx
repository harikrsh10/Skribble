'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateDummyPlayers, DummyPlayer } from '@/lib/dummyPlayers'

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

export interface GameSettings {
  hostName: string
  hostAvatar: string
  selectedCategories: string[]
  allowAdultWords: boolean
  roundTime: number
  totalRounds: number
}

export default function RoomSetup({ roomId, onStartGame, onCancel }: RoomSetupProps) {
  const [hostName, setHostName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['animals', 'food'])
  const [allowAdultWords, setAllowAdultWords] = useState(false)
  const [roundTime, setRoundTime] = useState(60)
  const [totalRounds, setTotalRounds] = useState(5)
  const [copied, setCopied] = useState(false)
  const [dummyPlayers, setDummyPlayers] = useState<DummyPlayer[]>([])

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

  // Generate dummy players on component mount
  useEffect(() => {
    const dummies = generateDummyPlayers(3)
    setDummyPlayers(dummies)
  }, [])

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
              <label htmlFor="adultWords" className="text-sm font-medium text-gray-700">
                Allow 18+ words
              </label>
            </div>
          </div>

          {/* Right Column - Game Settings & Room Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Settings</h2>
              
              {/* Round Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Round Time: {roundTime} seconds
                </label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Total Rounds */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rounds: {totalRounds}
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>
              </div>
            </div>

            {/* Room Link */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Link</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Participants</h2>
              <div className="space-y-2">
                {/* Host */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">{selectedAvatar}</span>
                  <div>
                    <div className="font-medium text-gray-800">{hostName || 'Host'}</div>
                    <div className="text-sm text-gray-500">👤 Host</div>
                  </div>
                </div>
                
                {/* Dummy Players */}
                {dummyPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="font-medium text-gray-800">{player.name}</div>
                      <div className="text-sm text-gray-500">🤖 AI Player</div>
                    </div>
                  </div>
                ))}
                
                <div className="text-sm text-gray-500 text-center py-4">
                  {dummyPlayers.length + 1} players ready to play!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartGame}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
} 