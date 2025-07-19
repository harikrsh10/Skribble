export interface WordCategory {
  id: string
  name: string
  icon: string
  words: string[]
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    words: [
      'cat', 'dog', 'elephant', 'giraffe', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'rabbit',
      'mouse', 'rat', 'hamster', 'guinea pig', 'bird', 'eagle', 'owl', 'penguin', 'duck', 'chicken',
      'cow', 'horse', 'pig', 'sheep', 'goat', 'deer', 'moose', 'zebra', 'rhino', 'hippo',
      'crocodile', 'alligator', 'snake', 'lizard', 'turtle', 'frog', 'toad', 'fish', 'shark', 'whale',
      'dolphin', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'ant', 'bee', 'butterfly', 'spider'
    ]
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: '🍕',
    words: [
      'pizza', 'hamburger', 'hot dog', 'sandwich', 'taco', 'burrito', 'sushi', 'pasta', 'rice', 'bread',
      'cake', 'cookie', 'ice cream', 'chocolate', 'candy', 'apple', 'banana', 'orange', 'grape', 'strawberry',
      'carrot', 'broccoli', 'tomato', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'corn', 'peas',
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon', 'tuna', 'egg', 'milk', 'cheese',
      'yogurt', 'butter', 'oil', 'salt', 'pepper', 'sugar', 'honey', 'jam', 'ketchup', 'mustard'
    ]
  },
  {
    id: 'movies',
    name: 'Movies & TV',
    icon: '🎬',
    words: [
      'movie', 'film', 'cinema', 'theater', 'actor', 'actress', 'director', 'producer', 'script', 'scene',
      'camera', 'microphone', 'lighting', 'costume', 'makeup', 'special effects', 'animation', 'comedy', 'drama', 'action',
      'horror', 'romance', 'thriller', 'documentary', 'western', 'sci-fi', 'fantasy', 'musical', 'cartoon', 'sitcom',
      'reality show', 'news', 'weather', 'sports', 'game show', 'talk show', 'soap opera', 'miniseries', 'pilot', 'episode'
    ]
  },
  {
    id: 'office',
    name: 'Office',
    icon: '💼',
    words: [
      'desk', 'chair', 'computer', 'keyboard', 'mouse', 'monitor', 'printer', 'scanner', 'phone', 'fax',
      'paper', 'pen', 'pencil', 'marker', 'highlighter', 'stapler', 'staples', 'paper clip', 'binder', 'folder',
      'file cabinet', 'bookshelf', 'whiteboard', 'chalkboard', 'projector', 'screen', 'meeting room', 'conference', 'presentation', 'report',
      'email', 'calendar', 'schedule', 'deadline', 'budget', 'invoice', 'contract', 'agreement', 'policy', 'procedure'
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    words: [
      'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf', 'volleyball', 'hockey', 'rugby', 'cricket',
      'swimming', 'running', 'cycling', 'boxing', 'wrestling', 'karate', 'judo', 'gymnastics', 'diving', 'skiing',
      'snowboarding', 'surfing', 'skateboarding', 'roller skating', 'ice skating', 'bowling', 'ping pong', 'badminton', 'racquetball', 'squash',
      'track', 'field', 'court', 'stadium', 'arena', 'gym', 'fitness', 'exercise', 'workout', 'training'
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌲',
    words: [
      'tree', 'flower', 'grass', 'bush', 'plant', 'forest', 'jungle', 'desert', 'mountain', 'hill',
      'valley', 'river', 'lake', 'ocean', 'sea', 'beach', 'island', 'cave', 'waterfall', 'spring',
      'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind', 'storm', 'lightning', 'thunder',
      'rainbow', 'sunset', 'sunrise', 'horizon', 'sky', 'earth', 'rock', 'stone', 'sand', 'soil'
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    words: [
      'car', 'truck', 'bus', 'train', 'plane', 'helicopter', 'boat', 'ship', 'submarine', 'motorcycle',
      'bicycle', 'scooter', 'skateboard', 'roller skates', 'skis', 'snowboard', 'surfboard', 'kayak', 'canoe', 'raft',
      'taxi', 'ambulance', 'fire truck', 'police car', 'tractor', 'bulldozer', 'crane', 'forklift', 'tank', 'jet',
      'rocket', 'spaceship', 'satellite', 'airport', 'station', 'port', 'dock', 'garage', 'parking lot', 'highway'
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    words: [
      'computer', 'laptop', 'tablet', 'phone', 'smartphone', 'television', 'radio', 'camera', 'video camera', 'microphone',
      'speaker', 'headphones', 'earbuds', 'keyboard', 'mouse', 'touchpad', 'monitor', 'screen', 'printer', 'scanner',
      'internet', 'website', 'app', 'software', 'program', 'code', 'algorithm', 'database', 'server', 'network',
      'wifi', 'bluetooth', 'usb', 'cable', 'wire', 'battery', 'charger', 'power', 'electricity', 'circuit'
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: '👕',
    words: [
      'shirt', 'pants', 'dress', 'skirt', 'jacket', 'coat', 'sweater', 'hoodie', 't-shirt', 'blouse',
      'socks', 'shoes', 'boots', 'sandals', 'sneakers', 'heels', 'flats', 'hat', 'cap', 'beanie',
      'scarf', 'gloves', 'mittens', 'belt', 'tie', 'bow tie', 'suit', 'uniform', 'costume', 'jewelry',
      'necklace', 'bracelet', 'ring', 'earrings', 'watch', 'sunglasses', 'glasses', 'backpack', 'purse', 'wallet'
    ]
  },
  {
    id: 'buildings',
    name: 'Buildings',
    icon: '🏠',
    words: [
      'house', 'apartment', 'building', 'skyscraper', 'tower', 'castle', 'palace', 'church', 'temple', 'mosque',
      'school', 'university', 'hospital', 'library', 'museum', 'theater', 'cinema', 'restaurant', 'hotel', 'motel',
      'office', 'factory', 'warehouse', 'garage', 'barn', 'shed', 'cabin', 'cottage', 'mansion', 'villa',
      'bridge', 'tunnel', 'dam', 'lighthouse', 'windmill', 'water tower', 'gas station', 'bank', 'post office', 'fire station'
    ]
  }
]

// Adult words (18+ content)
export const ADULT_WORDS = [
  'alcohol', 'beer', 'wine', 'cocktail', 'whiskey', 'vodka', 'rum', 'tequila', 'gin', 'brandy',
  'cigarette', 'cigar', 'pipe', 'tobacco', 'smoking', 'drinking', 'party', 'club', 'bar', 'pub',
  'casino', 'gambling', 'poker', 'blackjack', 'roulette', 'slot machine', 'bet', 'wager', 'stake', 'odds',
  'dating', 'romance', 'love', 'kiss', 'hug', 'marriage', 'wedding', 'divorce', 'relationship', 'affair'
]

export const getWordsByCategories = (categories: string[], allowAdult: boolean = false): string[] => {
  let words: string[] = []
  
  // Add words from selected categories
  categories.forEach(categoryId => {
    const category = WORD_CATEGORIES.find(cat => cat.id === categoryId)
    if (category) {
      words = [...words, ...category.words]
    }
  })
  
  // Add adult words if allowed
  if (allowAdult) {
    words = [...words, ...ADULT_WORDS]
  }
  
  return words
}

export const getRandomWord = (categories: string[], allowAdult: boolean = false): string => {
  const words = getWordsByCategories(categories, allowAdult)
  if (words.length === 0) return 'cat' // fallback
  return words[Math.floor(Math.random() * words.length)]
} 