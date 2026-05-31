import { Activity, Crosshair, Gauge, Shuffle, Skull } from 'lucide-react'
import { modeDefinitions, modeOrder } from '../modes/definitions'
import { useGameStore } from '../store/gameStore'
import type { ModeId } from '../types/game'

const modeIcons: Record<ModeId, typeof Gauge> = {
  standard: Gauge,
  decisive: Crosshair,
  hex: Skull,
  chaos: Shuffle,
  zen: Activity,
}

export function ModeSelector() {
  const modeId = useGameStore((state) => state.modeId)
  const setMode = useGameStore((state) => state.setMode)

  return (
    <section className="border border-stone-800 bg-stone-950/78 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">Mode</h2>
        <span className="h-2 w-2 bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.9)]" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {modeOrder.map((nextModeId) => {
          const mode = modeDefinitions[nextModeId]
          const Icon = modeIcons[nextModeId]
          const active = nextModeId === modeId

          return (
            <button
              key={nextModeId}
              type="button"
              onClick={() => setMode(nextModeId)}
              className={`group flex h-12 items-center justify-between border px-3 text-left transition ${
                active
                  ? 'border-red-500/80 bg-red-950/40 text-stone-50'
                  : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-600 hover:text-stone-100'
              }`}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} style={{ color: mode.accent }} aria-hidden />
                {mode.name}
              </span>
              <span className={`h-1.5 w-6 ${active ? 'bg-red-400' : 'bg-stone-700 group-hover:bg-stone-500'}`} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
