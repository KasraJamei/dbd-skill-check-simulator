import { Keyboard, RadioTower } from 'lucide-react'
import { modeDefinitions } from '../modes/definitions'
import { useGameStore } from '../store/gameStore'

export function TopBar() {
  const modeId = useGameStore((state) => state.modeId)
  const keybind = useGameStore((state) => state.settings.keybind)
  const mode = modeDefinitions[modeId]

  return (
    <header className="flex flex-col gap-4 border-b border-stone-800 bg-black/35 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <h1 className="text-xl font-black text-stone-100 md:text-2xl">Dead by Daylight Skill Check Simulator</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
          <RadioTower size={15} style={{ color: mode.accent }} aria-hidden />
          <span>{mode.name}</span>
        </div>
      </div>
      <div className="flex h-10 items-center gap-3 border border-stone-800 bg-stone-950 px-3 text-sm text-stone-300">
        <Keyboard size={16} aria-hidden />
        <span className="font-mono">{keybind.label}</span>
      </div>
    </header>
  )
}
