import { useEffect, useRef } from 'react'
import { SkillAudio } from '../audio/SkillAudio'
import { InputController } from '../systems/InputController'
import { SkillCheckEngine } from '../systems/SkillCheckEngine'
import { useGameStore } from '../store/gameStore'

export function SkillCheckCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<SkillCheckEngine | null>(null)
  const modeId = useGameStore((state) => state.modeId)
  const speedScale = useGameStore((state) => state.settings.speedScale)
  const zoneScale = useGameStore((state) => state.settings.zoneScale)
  const visualAids = useGameStore((state) => state.settings.visualAids)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const audio = new SkillAudio(() => useGameStore.getState().settings.volume)
    const engine = new SkillCheckEngine(canvas, {
      getModeId: () => useGameStore.getState().modeId,
      getSettings: () => useGameStore.getState().settings,
      onAttempt: (result) => useGameStore.getState().recordAttempt(result),
      audio,
    })
    const input = new InputController(
      () => useGameStore.getState().settings.keybind,
      (timestamp) => {
        audio.resume()
        engine.trigger(timestamp)
      },
    )

    engineRef.current = engine
    input.start()
    engine.start()

    return () => {
      input.stop()
      engine.stop()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.reset(performance.now())
  }, [modeId, speedScale, zoneScale, visualAids])

  return (
    <div className="relative min-h-[360px] overflow-hidden border border-stone-800/80 bg-stone-950/70 shadow-2xl shadow-black/50 md:min-h-[520px]">
      <canvas ref={canvasRef} className="h-full min-h-[360px] w-full md:min-h-[520px]" aria-label="Skill check timing ring" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  )
}
