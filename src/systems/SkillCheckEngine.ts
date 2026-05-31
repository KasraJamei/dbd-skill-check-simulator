import { SkillAudio } from '../audio/SkillAudio'
import { createAttemptConfig } from '../modes/definitions'
import type { AttemptConfig, AttemptResult, GameSettings, ModeId } from '../types/game'
import { isAngleInZone, TAU, turnToRadians, wrapUnit } from '../utils/angle'
import { evaluateAttempt } from './evaluateAttempt'

interface EngineOptions {
  getModeId: () => ModeId
  getSettings: () => GameSettings
  onAttempt: (result: AttemptResult) => void
  audio: SkillAudio
}

interface ResultFlash {
  result: AttemptResult
  attempt: AttemptConfig
  angle: number
  until: number
}

export class SkillCheckEngine {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private options: EngineOptions
  private frameId = 0
  private running = false
  private attemptCounter = 0
  private currentAttempt: AttemptConfig | null = null
  private lastAttempt: AttemptConfig | null = null
  private resultFlash: ResultFlash | null = null
  private nextAttemptAt = 0
  private angle = 0
  private turnsElapsed = 0
  private lastFrameAt = 0
  private enteredSuccessAt: number | null = null
  private hasEnteredSuccessZone = false
  private width = 0
  private height = 0
  private pixelRatio = 1

  constructor(canvas: HTMLCanvasElement, options: EngineOptions) {
    const context = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })

    if (!context) {
      throw new Error('Canvas 2D context is not available.')
    }

    this.canvas = canvas
    this.context = context
    this.options = options
  }

  start() {
    if (this.running) {
      return
    }

    this.running = true
    this.resize()
    this.startAttempt(performance.now())
    this.frameId = requestAnimationFrame(this.tick)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.frameId)
  }

  reset(timestamp = performance.now()) {
    this.resultFlash = null
    this.nextAttemptAt = 0
    this.startAttempt(timestamp)
  }

  trigger(timestamp = performance.now()) {
    if (!this.currentAttempt) {
      return
    }

    this.resolveAttempt(timestamp, false)
  }

  private tick = (timestamp: number) => {
    if (!this.running) {
      return
    }

    this.resize()
    this.update(timestamp)
    this.draw(timestamp)
    this.lastFrameAt = timestamp
    this.frameId = requestAnimationFrame(this.tick)
  }

  private update(timestamp: number) {
    if (!this.currentAttempt) {
      if (timestamp >= this.nextAttemptAt) {
        this.startAttempt(timestamp)
      }

      return
    }

    if (this.lastFrameAt === 0) {
      this.lastFrameAt = timestamp
    }

    const deltaSeconds = Math.min((timestamp - this.lastFrameAt) / 1000, 0.05)
    const attempt = this.currentAttempt
    const turnDelta = attempt.speedTurnsPerSecond * deltaSeconds

    this.angle = wrapUnit(this.angle + attempt.direction * turnDelta)
    this.turnsElapsed += turnDelta

    if (!this.hasEnteredSuccessZone && isAngleInZone(this.getNeedleAngle(timestamp), attempt.successZone)) {
      this.enteredSuccessAt = timestamp
      this.hasEnteredSuccessZone = true
    }

    if (this.turnsElapsed >= 1.04) {
      this.resolveAttempt(timestamp, true)
    }
  }

  private startAttempt(timestamp: number) {
    const settings = this.options.getSettings()
    const modeId = this.options.getModeId()
    const attempt = createAttemptConfig(modeId, settings, this.attemptCounter + 1, timestamp)

    this.attemptCounter += 1
    this.currentAttempt = attempt
    this.lastAttempt = attempt
    this.angle = attempt.direction === 1 ? 0 : 0.995
    this.turnsElapsed = 0
    this.enteredSuccessAt = null
    this.hasEnteredSuccessZone = false
    this.lastFrameAt = timestamp
    this.options.audio.cueReady()
  }

  private resolveAttempt(timestamp: number, timedOut: boolean) {
    if (!this.currentAttempt) {
      return
    }

    const attempt = this.currentAttempt
    const hitAngle = this.getNeedleAngle(timestamp)
    const result = evaluateAttempt(attempt, hitAngle, timestamp, this.enteredSuccessAt, timedOut)

    if (result.grade === 'great') {
      this.options.audio.playGreat()
    } else if (result.grade === 'success') {
      this.options.audio.playSuccess()
    } else {
      this.options.audio.playFail()
    }

    this.options.onAttempt(result)
    this.resultFlash = {
      result,
      attempt,
      angle: hitAngle,
      until: timestamp + 650,
    }
    this.currentAttempt = null
    this.lastAttempt = attempt
    this.nextAttemptAt = timestamp + 760
  }

  private getNeedleAngle(timestamp: number) {
    if (!this.currentAttempt) {
      return this.resultFlash?.angle ?? this.angle
    }

    const jitter = this.currentAttempt.jitterStrength

    if (jitter === 0) {
      return this.angle
    }

    const wobble = Math.sin(timestamp * 0.031) * jitter + Math.sin(timestamp * 0.071) * jitter * 0.45

    return wrapUnit(this.angle + wobble)
  }

  private resize() {
    const nextWidth = Math.max(1, this.canvas.clientWidth)
    const nextHeight = Math.max(1, this.canvas.clientHeight)
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    if (this.width === nextWidth && this.height === nextHeight && this.pixelRatio === nextPixelRatio) {
      return
    }

    this.width = nextWidth
    this.height = nextHeight
    this.pixelRatio = nextPixelRatio
    this.canvas.width = Math.floor(nextWidth * nextPixelRatio)
    this.canvas.height = Math.floor(nextHeight * nextPixelRatio)
    this.context.setTransform(nextPixelRatio, 0, 0, nextPixelRatio, 0, 0)
  }

  private draw(timestamp: number) {
    const context = this.context
    const centerX = this.width / 2
    const centerY = this.height / 2
    const radius = Math.min(this.width, this.height) * 0.34
    const activeAttempt = this.currentAttempt ?? this.lastAttempt
    const needleAngle = this.currentAttempt ? this.getNeedleAngle(timestamp) : (this.resultFlash?.angle ?? this.angle)

    context.clearRect(0, 0, this.width, this.height)
    this.drawBackdrop(context, centerX, centerY, radius, timestamp)

    if (!activeAttempt) {
      return
    }

    context.save()
    context.translate(centerX, centerY)
    this.drawTimingRing(context, radius)
    this.drawZone(context, activeAttempt.successZone.start, activeAttempt.successZone.size, radius, 'rgba(185, 212, 143, 0.46)', 18)
    this.drawZone(context, activeAttempt.greatZone.start, activeAttempt.greatZone.size, radius, 'rgba(255, 255, 244, 0.9)', 12)

    if (activeAttempt.visualAids) {
      this.drawVisualAids(context, activeAttempt, radius)
    }

    this.drawNeedle(context, needleAngle, radius, activeAttempt)
    this.drawCenter(context, radius, activeAttempt)
    this.drawResultFlash(context, radius)
    context.restore()
  }

  private drawBackdrop(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    timestamp: number,
  ) {
    const pulse = 0.5 + Math.sin(timestamp * 0.002) * 0.5
    const gradient = context.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.65)

    gradient.addColorStop(0, `rgba(128, 18, 25, ${0.16 + pulse * 0.04})`)
    gradient.addColorStop(0.48, 'rgba(21, 22, 24, 0.82)')
    gradient.addColorStop(1, 'rgba(4, 5, 6, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, this.width, this.height)

    context.save()
    context.globalAlpha = 0.22
    context.strokeStyle = '#2d3130'
    context.lineWidth = 1

    for (let scratchIndex = 0; scratchIndex < 14; scratchIndex += 1) {
      const x = ((scratchIndex * 83 + 17) % Math.max(this.width, 1)) + Math.sin(timestamp * 0.0008 + scratchIndex) * 5
      const y = ((scratchIndex * 47 + 29) % Math.max(this.height, 1))

      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + 26, y + 90)
      context.stroke()
    }

    context.restore()
  }

  private drawTimingRing(context: CanvasRenderingContext2D, radius: number) {
    context.lineCap = 'round'
    context.strokeStyle = 'rgba(229, 221, 202, 0.18)'
    context.lineWidth = 22
    context.beginPath()
    context.arc(0, 0, radius, 0, TAU)
    context.stroke()

    context.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    context.lineWidth = 2

    for (let tickIndex = 0; tickIndex < 48; tickIndex += 1) {
      const angle = (tickIndex / 48) * TAU - Math.PI / 2
      const innerRadius = radius - (tickIndex % 4 === 0 ? 18 : 10)
      const outerRadius = radius + (tickIndex % 4 === 0 ? 18 : 10)

      context.beginPath()
      context.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius)
      context.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
      context.stroke()
    }
  }

  private drawZone(
    context: CanvasRenderingContext2D,
    start: number,
    size: number,
    radius: number,
    color: string,
    lineWidth: number,
  ) {
    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.beginPath()
    context.arc(0, 0, radius, turnToRadians(start), turnToRadians(start + size), false)
    context.stroke()
  }

  private drawVisualAids(context: CanvasRenderingContext2D, attempt: AttemptConfig, radius: number) {
    const startAngle = turnToRadians(attempt.successZone.start)
    const endAngle = turnToRadians(attempt.successZone.start + attempt.successZone.size)

    context.save()
    context.strokeStyle = 'rgba(143, 227, 136, 0.18)'
    context.lineWidth = 1

    for (const angle of [startAngle, endAngle]) {
      context.beginPath()
      context.moveTo(Math.cos(angle) * (radius * 0.42), Math.sin(angle) * (radius * 0.42))
      context.lineTo(Math.cos(angle) * (radius * 1.23), Math.sin(angle) * (radius * 1.23))
      context.stroke()
    }

    context.restore()
  }

  private drawNeedle(context: CanvasRenderingContext2D, angle: number, radius: number, attempt: AttemptConfig) {
    const radians = turnToRadians(angle)
    const needleLength = radius * 1.12

    context.save()
    context.rotate(radians)
    context.shadowColor = attempt.modeId === 'decisive' ? '#ff4d5a' : '#d5d0bf'
    context.shadowBlur = 18
    context.strokeStyle = '#f1ead9'
    context.lineWidth = 4
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(needleLength, 0)
    context.stroke()

    context.fillStyle = '#d2343e'
    context.beginPath()
    context.arc(needleLength, 0, 6, 0, TAU)
    context.fill()
    context.restore()
  }

  private drawCenter(context: CanvasRenderingContext2D, radius: number, attempt: AttemptConfig) {
    context.fillStyle = '#101112'
    context.strokeStyle = attempt.modeId === 'hex' ? '#c264ff' : '#7d2027'
    context.lineWidth = 2
    context.beginPath()
    context.arc(0, 0, Math.max(32, radius * 0.16), 0, TAU)
    context.fill()
    context.stroke()

    context.fillStyle = '#e9dfc9'
    context.font = '600 12px Inter, ui-sans-serif, system-ui'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(attempt.direction === 1 ? 'CW' : 'CCW', 0, 0)
  }

  private drawResultFlash(context: CanvasRenderingContext2D, radius: number) {
    if (!this.resultFlash) {
      return
    }

    const now = performance.now()
    const timeLeft = this.resultFlash.until - now

    if (timeLeft <= 0) {
      this.resultFlash = null
      return
    }

    const alpha = Math.min(1, timeLeft / 260)
    const grade = this.resultFlash.result.grade
    const label = grade === 'great' ? 'GREAT' : grade === 'success' ? 'SUCCESS' : 'MISS'

    context.save()
    context.globalAlpha = alpha
    context.fillStyle = grade === 'great' ? '#fff8dc' : grade === 'success' ? '#b9d48f' : '#ff4d5a'
    context.font = '800 28px Inter, ui-sans-serif, system-ui'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(label, 0, radius * 0.48)
    context.restore()
  }
}
