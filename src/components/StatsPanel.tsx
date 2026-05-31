import { BarChart3, Flame, Gauge, Target, Timer, Trophy } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { formatMs, formatPercent, formatSignedMs } from '../utils/format'

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-stone-800 bg-stone-900/70 p-3">
      <div className="text-xs uppercase tracking-[0.12em] text-stone-500">{label}</div>
      <div className="mt-1 font-mono text-xl text-stone-100">{value}</div>
    </div>
  )
}

export function StatsPanel() {
  const stats = useGameStore((state) => state.stats)
  const modeId = useGameStore((state) => state.modeId)
  const modeStats = stats.byMode[modeId]
  const lastResult = useGameStore((state) => state.lastResult)
  const successRate = stats.attempts === 0 ? 0 : (stats.successes / stats.attempts) * 100

  return (
    <section className="border border-stone-800 bg-stone-950/78 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
          <BarChart3 size={16} aria-hidden />
          Run
        </h2>
        <span className="font-mono text-xs text-stone-500">{formatPercent(successRate)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Score" value={stats.score} />
        <StatTile label="Streak" value={stats.streak} />
        <StatTile label="Best" value={stats.bestStreak} />
        <StatTile label="Greats" value={stats.greats} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-stone-300">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <span className="flex items-center gap-2">
            <Timer size={15} aria-hidden />
            Reaction
          </span>
          <span className="font-mono text-stone-100">{formatMs(stats.averageReactionMs)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <span className="flex items-center gap-2">
            <Target size={15} aria-hidden />
            Accuracy
          </span>
          <span className="font-mono text-stone-100">{formatPercent(stats.averageAccuracy)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <span className="flex items-center gap-2">
            <Gauge size={15} aria-hidden />
            Mode rate
          </span>
          <span className="font-mono text-stone-100">
            {modeStats.attempts === 0 ? '--' : formatPercent((modeStats.successes / modeStats.attempts) * 100)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame size={15} aria-hidden />
            Last
          </span>
          <span className="font-mono text-stone-100">
            {lastResult ? `${lastResult.grade.toUpperCase()} ${formatSignedMs(lastResult.errorMs)}` : '--'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border border-red-950/70 bg-red-950/20 p-3 text-sm text-red-100">
        <Trophy size={16} aria-hidden />
        <span className="font-mono">{lastResult ? `${lastResult.scoreDelta >= 0 ? '+' : ''}${lastResult.scoreDelta}` : '+0'}</span>
      </div>
    </section>
  )
}
