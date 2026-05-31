import { Medal } from 'lucide-react'
import { modeDefinitions } from '../modes/definitions'
import { useGameStore } from '../store/gameStore'
import { formatClock, formatPercent } from '../utils/format'

export function LeaderboardPanel() {
  const leaderboard = useGameStore((state) => state.leaderboard)

  return (
    <section className="border border-stone-800 bg-stone-950/78 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
        <Medal size={16} aria-hidden />
        Leaderboard
      </div>
      <div className="grid gap-2">
        {leaderboard.length === 0 ? (
          <div className="border border-stone-800 bg-stone-900/60 p-3 text-sm text-stone-500">Finish a timed run</div>
        ) : (
          leaderboard.slice(0, 5).map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-stone-800 bg-stone-900/60 px-3 py-2 text-sm text-stone-300"
            >
              <span className="font-mono text-stone-500">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-stone-100">{modeDefinitions[entry.modeId].name}</span>
                <span className="font-mono text-xs text-stone-500">
                  {formatPercent(entry.successRate)} / {formatClock(entry.elapsedMs)}
                </span>
              </span>
              <span className="font-mono text-amber-100">{entry.score}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
