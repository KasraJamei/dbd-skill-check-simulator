type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

type AudioCue = 'ready' | 'success' | 'great' | 'fail'

const customCueUrls: Record<AudioCue, string> = {
  ready: '/audio/skill-check-warning.ogg',
  success: '/audio/skill-check-success.ogg',
  great: '/audio/skill-check-great.ogg',
  fail: '/audio/skill-check-fail.ogg',
}

export class SkillAudio {
  private context: AudioContext | null = null
  private getVolume: () => number
  private buffers = new Map<AudioCue, AudioBuffer | null>()
  private loading = new Map<AudioCue, Promise<AudioBuffer | null>>()

  constructor(getVolume: () => number) {
    this.getVolume = getVolume
    for (const cue of Object.keys(customCueUrls) as AudioCue[]) {
      void this.loadCustomCue(cue)
    }
  }

  resume() {
    const context = this.ensureContext()

    if (context.state === 'suspended') {
      void context.resume()
    }
  }

  cueReady() {
    if (this.playCustomCue('ready')) {
      return
    }

    this.playTone(410, 0.035, 'triangle', 0.05)
    this.playTone(620, 0.06, 'sine', 0.025, 0.024)
  }

  playSuccess() {
    if (this.playCustomCue('success')) {
      return
    }

    this.playTone(460, 0.045, 'triangle', 0.08)
    this.playTone(690, 0.075, 'sine', 0.07, 0.035)
  }

  playGreat() {
    if (this.playCustomCue('great')) {
      return
    }

    this.playTone(620, 0.04, 'triangle', 0.1)
    this.playTone(920, 0.08, 'sine', 0.08, 0.032)
  }

  playFail() {
    if (this.playCustomCue('fail')) {
      return
    }

    this.playTone(112, 0.12, 'sawtooth', 0.09)
    this.playTone(68, 0.2, 'sawtooth', 0.065, 0.036)
  }

  private ensureContext() {
    if (this.context) {
      return this.context
    }

    const AudioContextConstructor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext

    if (!AudioContextConstructor) {
      throw new Error('Web Audio API is not available in this environment.')
    }

    this.context = new AudioContextConstructor({
      latencyHint: 'interactive',
    })

    return this.context
  }

  private async loadCustomCue(cue: AudioCue) {
    const existingLoad = this.loading.get(cue)

    if (existingLoad) {
      return existingLoad
    }

    const load = fetch(customCueUrls[cue], { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) {
          this.buffers.set(cue, null)
          return null
        }

        const context = this.ensureContext()
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await context.decodeAudioData(arrayBuffer)

        this.buffers.set(cue, buffer)
        return buffer
      })
      .catch(() => {
        this.buffers.set(cue, null)
        return null
      })

    this.loading.set(cue, load)
    return load
  }

  private playCustomCue(cue: AudioCue) {
    const buffer = this.buffers.get(cue)
    const volume = this.getVolume()

    if (!buffer || volume <= 0) {
      return false
    }

    const context = this.ensureContext()
    const source = context.createBufferSource()
    const gainNode = context.createGain()

    source.buffer = buffer
    gainNode.gain.value = volume
    source.connect(gainNode)
    gainNode.connect(context.destination)
    source.start()

    return true
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    type: OscillatorType,
    gain: number,
    offsetSeconds = 0,
  ) {
    const volume = this.getVolume()

    if (volume <= 0) {
      return
    }

    const context = this.ensureContext()
    const startTime = context.currentTime + offsetSeconds
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const scaledGain = gain * volume

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)
    gainNode.gain.setValueAtTime(0.0001, startTime)
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, scaledGain), startTime + 0.006)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + durationSeconds + 0.02)
  }
}
