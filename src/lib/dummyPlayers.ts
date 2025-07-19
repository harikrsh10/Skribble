export interface DummyPlayer {
  id: string
  name: string
  avatar: string
  isAI: boolean
  score: number
  isOnline: boolean
}

export const DUMMY_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander'
]

export const DUMMY_AVATARS = [
  '🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦄',
  '🦋', '🐞', '🦅', '🦉', '🐧', '🦕', '🦖', '🐢', '🦎', '🐍',
  '🦒', '🦊', '🐻', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆'
]

export const generateDummyPlayers = (count: number = 3): DummyPlayer[] => {
  const players: DummyPlayer[] = []
  
  for (let i = 0; i < count; i++) {
    const name = DUMMY_NAMES[Math.floor(Math.random() * DUMMY_NAMES.length)]
    const avatar = DUMMY_AVATARS[Math.floor(Math.random() * DUMMY_AVATARS.length)]
    
    players.push({
      id: `dummy_${i + 1}`,
      name: `${name}${i + 1}`,
      avatar,
      isAI: true,
      score: Math.floor(Math.random() * 200),
      isOnline: true
    })
  }
  
  return players
}

export const simulateAIGuess = (currentWord: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string => {
  const wordLower = currentWord.toLowerCase()
  
  // Easy AI: Sometimes gets it right, sometimes close
  if (difficulty === 'easy') {
    if (Math.random() < 0.3) {
      return currentWord // Correct guess
    } else if (Math.random() < 0.4) {
      // Close guess - return part of the word
      const length = currentWord.length
      if (length > 3) {
        return currentWord.substring(0, Math.floor(length * 0.7))
      }
    }
  }
  
  // Medium AI: More likely to get it right
  if (difficulty === 'medium') {
    if (Math.random() < 0.5) {
      return currentWord // Correct guess
    } else if (Math.random() < 0.3) {
      // Close guess
      const length = currentWord.length
      if (length > 2) {
        return currentWord.substring(0, Math.floor(length * 0.8))
      }
    }
  }
  
  // Hard AI: Very likely to get it right
  if (difficulty === 'hard') {
    if (Math.random() < 0.7) {
      return currentWord // Correct guess
    }
  }
  
  // Wrong guesses based on word length
  const wrongGuesses = [
    'cat', 'dog', 'house', 'tree', 'car', 'book', 'phone', 'computer',
    'pizza', 'apple', 'water', 'fire', 'earth', 'wind', 'sun', 'moon',
    'star', 'flower', 'bird', 'fish', 'game', 'play', 'work', 'home'
  ]
  
  return wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)]
}

export const simulateAIMessage = (): string => {
  const messages = [
    "Hmm, what could this be? 🤔",
    "I think I know what it is!",
    "This is tricky...",
    "Nice drawing!",
    "Almost got it!",
    "Is it...?",
    "I'm stumped! 😅",
    "Great job drawing!",
    "This is fun!",
    "I see what you're drawing!",
    "Keep going!",
    "Almost there!",
    "I think I know!",
    "This is a good one!",
    "Drawing skills on point! 👏"
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
} 