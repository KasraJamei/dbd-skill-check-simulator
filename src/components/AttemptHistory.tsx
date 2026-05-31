import { History } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import type { HitGrade } from '../types/game'
import { formatMs } from '../utils/format'

const gradeStyles: Record<HitGrade, string> = {
  great: 'border-amber-200/70 text-amber-100',
  success: 'border-lime-300/60 text-lime-100',
  fail: 'border-red-400/70 text-red-100',
  timeout: 'border-red-700/70 text-red-200',
}

export function AttemptHistory() {
  const history = useGameStore((state) => state.history)

  return (
    <section className="border border-stone-800 bg-stone-950/78 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
        <History size={16} aria-hidden />
        Attempts
      </div>
      <div className="grid gap-2">
        {history.length === 0 ? (
          <div className="border border-stone-800 bg-stone-900/60 p-3 text-sm text-stone-500">No attempts yet</div>
        ) : (
          history.map((result) => (
            <div
              key={`${result.attemptId}-${result.timestamp}`}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 border bg-stone-900/60 px-3 py-2 text-sm ${gradeStyles[result.grade]}`}
            >
              <span className="font-semibold uppercase">{result.grade}</span>
              <span className="font-mono text-stone-400">{formatMs(result.reactionMs)}</span>
              <span className="font-mono">{Math.round(result.accuracy)}%</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
