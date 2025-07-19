'use client'

interface Player {
  id: string
  info?: {
    name: string
    picture: string
  }
  isAI?: boolean
}

interface ScoreboardProps {
  players: Player[]
  scores: Record<string, number>
}

export default function Scoreboard({ players, scores }: ScoreboardProps) {
  const sortedPlayers = players
    .map(player => ({
      ...player,
      score: scores[player.id] || 0,
      name: player.info?.name || `Player${player.id.slice(-4)}`
    }))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="bg-white rounded-lg shadow h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Scoreboard</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
                                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{player.name}</div>
                      <div className="text-sm text-gray-500">
                        {player.isAI ? '🤖 AI Player' : '👤 You'}
                      </div>
                    </div>
                  </div>
              <div className="text-lg font-bold text-blue-600">
                {player.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 