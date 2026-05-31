import { Eye, Keyboard, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { keybindFromKeyboardEvent } from '../utils/input'

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
}) {
  return (
    <label className="grid gap-2 text-sm text-stone-300">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-xs text-stone-500">
          {value.toFixed(Number.isInteger(step) ? 0 : step < 0.1 ? 2 : 1)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-red-500"
      />
    </label>
  )
}

export function SettingsPanel() {
  const settings = useGameStore((state) => state.settings)
  const updateSettings = useGameStore((state) => state.updateSettings)
  const resetSettings = useGameStore((state) => state.resetSettings)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!listening) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      updateSettings({ keybind: keybindFromKeyboardEvent(event) })
      setListening(false)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [listening, updateSettings])

  return (
    <section className="border border-stone-800 bg-stone-950/78 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
          <SlidersHorizontal size={16} aria-hidden />
          Settings
        </h2>
        <button
          type="button"
          onClick={resetSettings}
          className="inline-flex h-9 w-9 items-center justify-center border border-stone-800 bg-stone-900 text-stone-400 transition hover:border-red-500/60 hover:text-red-200"
          aria-label="Reset settings"
          title="Reset settings"
        >
          <RotateCcw size={16} aria-hidden />
        </button>
      </div>

      <div className="grid gap-5">
        <SliderControl
          label="Speed"
          value={settings.speedScale}
          min={0.55}
          max={1.45}
          step={0.05}
          onChange={(speedScale) => updateSettings({ speedScale })}
          suffix="x"
        />
        <SliderControl
          label="Hitbox"
          value={settings.zoneScale}
          min={0.65}
          max={1.35}
          step={0.05}
          onChange={(zoneScale) => updateSettings({ zoneScale })}
          suffix="x"
        />
        <SliderControl
          label="Volume"
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(volume) => updateSettings({ volume })}
        />
        <SliderControl
          label="Round timer"
          value={settings.roundDurationSeconds}
          min={30}
          max={180}
          step={15}
          onChange={(roundDurationSeconds) => updateSettings({ roundDurationSeconds })}
          suffix="s"
        />

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setListening(true)}
            className={`flex h-11 items-center justify-between border px-3 text-sm transition ${
              listening
                ? 'border-red-400 bg-red-950/50 text-red-100'
                : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Keyboard size={16} aria-hidden />
              Keybind
            </span>
            <span className="font-mono text-xs">{listening ? 'Press key' : settings.keybind.label}</span>
          </button>

          <label className="flex h-11 items-center justify-between border border-stone-800 bg-stone-900 px-3 text-sm text-stone-300">
            <span className="flex items-center gap-2">
              <Eye size={16} aria-hidden />
              Timing guide
            </span>
            <input
              type="checkbox"
              checked={settings.timingGuide}
              onChange={(event) => updateSettings({ timingGuide: event.target.checked })}
              className="h-4 w-4 accent-red-500"
              title="Shows subtle boundary lines for the success zone"
            />
          </label>
        </div>
      </div>
    </section>
  )
}
