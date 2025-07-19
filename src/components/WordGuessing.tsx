'use client'

import { useState, useEffect } from 'react'

interface WordGuessingProps {
  currentWord: string
  onGuess: (guess: string) => void
  isDrawer: boolean
  timeLeft: number
}

export default function WordGuessing({ 
  currentWord, 
  onGuess, 
  isDrawer, 
  timeLeft 
}: WordGuessingProps) {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const handleGuess = () => {
    if (!guess.trim()) return
    
    const guessLower = guess.trim().toLowerCase()
    const wordLower = currentWord.toLowerCase()
    
    // Check if guess is correct
    if (guessLower === wordLower) {
      onGuess(guess.trim())
      setGuess('')
      setFeedback('')
      setShowFeedback(false)
      return
    }
    
    // Check for close guesses
    const similarity = calculateSimilarity(guessLower, wordLower)
    let feedbackMessage = ''
    
    if (similarity >= 0.8) {
      feedbackMessage = "You're very close! 🔥"
    } else if (similarity >= 0.6) {
      feedbackMessage = "Almost there! 💪"
    } else if (similarity >= 0.4) {
      feedbackMessage = "Getting warmer! 🌡️"
    } else if (wordLower.includes(guessLower) || guessLower.includes(wordLower)) {
      feedbackMessage = "That's part of it! 🎯"
    } else {
      feedbackMessage = "Not quite right, try again! 🤔"
    }
    
    setFeedback(feedbackMessage)
    setShowFeedback(true)
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false)
      setFeedback('')
    }, 3000)
    
    setGuess('')
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const renderWordTemplate = () => {
    if (!currentWord) return null
    
    return (
      <div className="mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Guess the word:</div>
          <div className="flex justify-center gap-2 mb-4">
            {currentWord.split('').map((letter, index) => (
              <div
                key={index}
                className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center text-lg font-bold text-gray-400"
              >
                _
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Word length: {currentWord.length} letters
          </div>
        </div>
      </div>
    )
  }

  const renderHints = () => {
    if (!currentWord) return null
    
    const hints = []
    
    // First letter hint
    hints.push(`Starts with: ${currentWord[0].toUpperCase()}`)
    
    // Last letter hint
    hints.push(`Ends with: ${currentWord[currentWord.length - 1].toUpperCase()}`)
    
    // Length hint
    hints.push(`${currentWord.length} letters`)
    
    return (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-800 mb-2">Hints:</div>
        <div className="flex flex-wrap gap-2">
          {hints.map((hint, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (isDrawer) {
    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-2">
            You're drawing!
          </div>
          <div className="text-sm text-gray-600">
            Other players are guessing your word
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      {renderWordTemplate()}
      {renderHints()}
      
      {/* Feedback Message */}
      {showFeedback && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-800 font-medium">
            {feedback}
          </div>
        </div>
      )}
      
      {/* Guess Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your guess..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
          />
          <button
            onClick={handleGuess}
            disabled={!guess.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Guess
          </button>
        </div>
        
        {/* Timer */}
        <div className="text-center">
          <div className="text-sm text-gray-600">Time remaining:</div>
          <div className={`text-2xl font-bold ${
            timeLeft <= 10 ? 'text-red-600' : 
            timeLeft <= 30 ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>
    </div>
  )
} 