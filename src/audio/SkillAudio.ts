type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

export class SkillAudio {
  private context: AudioContext | null = null
  private getVolume: () => number

  constructor(getVolume: () => number) {
    this.getVolume = getVolume
  }

  resume() {
    const context = this.ensureContext()

    if (context.state === 'suspended') {
      void context.resume()
    }
  }

  cueReady() {
    this.playTone(420, 0.045, 'triangle', 0.08)
  }

  playSuccess() {
    this.playTone(520, 0.07, 'sine', 0.11)
    this.playTone(760, 0.08, 'sine', 0.08, 0.04)
  }

  playGreat() {
    this.playTone(700, 0.055, 'triangle', 0.13)
    this.playTone(980, 0.09, 'triangle', 0.1, 0.035)
  }

  playFail() {
    this.playTone(128, 0.13, 'sawtooth', 0.1)
    this.playTone(74, 0.18, 'sawtooth', 0.07, 0.04)
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
