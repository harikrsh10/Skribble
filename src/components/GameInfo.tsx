'use client'

interface GameInfoProps {
  roomId: string
  currentWord: string
  timeLeft: number
  isDrawer: boolean
  currentRound?: number
  totalRounds?: number
}

export default function GameInfo({ roomId, currentWord, timeLeft, isDrawer, currentRound, totalRounds }: GameInfoProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Room: {roomId}</h2>
          <p className="text-gray-600">
            {isDrawer ? 'You are drawing!' : 'Waiting for someone to draw...'}
          </p>
          {currentRound && totalRounds && (
            <p className="text-sm text-gray-500">
              Round {currentRound} of {totalRounds}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
          <div className="text-sm text-gray-500">Time remaining</div>
        </div>
      </div>
      
      {isDrawer && currentWord && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Draw this word:</p>
          <p className="text-xl font-bold text-blue-800">{currentWord}</p>
        </div>
      )}
    </div>
  )
} 