import type {
  AttemptConfig,
  GameSettings,
  HitZone,
  ModeDefinition,
  ModeId,
  RotationDirection,
} from '../types/game'
import { clamp, wrapUnit } from '../utils/angle'

export const modeOrder: ModeId[] = ['standard', 'decisive', 'hex', 'chaos', 'zen']

export const modeDefinitions: Record<ModeId, ModeDefinition> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    accent: '#d9b56f',
    baseSpeedTurnsPerSecond: 0.72,
    successZoneSize: 0.13,
    greatZoneSize: 0.036,
    direction: 1,
    jitterStrength: 0,
    speedVariance: 0.04,
    zoneVariance: 0.08,
    scoreMultiplier: 1,
  },
  decisive: {
    id: 'decisive',
    name: 'Decisive Strike',
    accent: '#ff4d5a',
    baseSpeedTurnsPerSecond: 1.02,
    successZoneSize: 0.075,
    greatZoneSize: 0.018,
    direction: 1,
    jitterStrength: 0,
    speedVariance: 0.02,
    zoneVariance: 0.03,
    scoreMultiplier: 1.7,
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    accent: '#c264ff',
    baseSpeedTurnsPerSecond: 0.86,
    successZoneSize: 0.105,
    greatZoneSize: 0.028,
    direction: -1,
    jitterStrength: 0.006,
    speedVariance: 0.14,
    zoneVariance: 0.36,
    scoreMultiplier: 1.35,
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos',
    accent: '#38d6c8',
    baseSpeedTurnsPerSecond: 0.82,
    successZoneSize: 0.105,
    greatZoneSize: 0.026,
    direction: 'random',
    jitterStrength: 0.003,
    speedVariance: 0.44,
    zoneVariance: 0.52,
    scoreMultiplier: 1.55,
  },
  zen: {
    id: 'zen',
    name: 'Zen Trainer',
    accent: '#8fe388',
    baseSpeedTurnsPerSecond: 0.42,
    successZoneSize: 0.17,
    greatZoneSize: 0.05,
    direction: 1,
    jitterStrength: 0,
    speedVariance: 0,
    zoneVariance: 0,
    scoreMultiplier: 0.7,
  },
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomVariance(variance: number) {
  return randomBetween(1 - variance, 1 + variance)
}

function resolveDirection(direction: ModeDefinition['direction']): RotationDirection {
  if (direction === 'random') {
    return Math.random() > 0.5 ? 1 : -1
  }

  return direction
}

function createZonePair(mode: ModeDefinition, settings: GameSettings): Pick<AttemptConfig, 'successZone' | 'greatZone'> {
  const successSize = clamp(
    mode.successZoneSize * settings.zoneScale * randomVariance(mode.zoneVariance),
    0.035,
    0.24,
  )
  const greatSize = clamp(
    Math.min(successSize * 0.44, mode.greatZoneSize * settings.zoneScale * randomVariance(mode.zoneVariance / 2)),
    0.01,
    successSize * 0.5,
  )
  const successStart = randomBetween(0.18, 0.84)
  const greatInset = randomBetween(successSize * 0.18, successSize - greatSize - successSize * 0.18)
  const successZone: HitZone = {
    start: wrapUnit(successStart),
    size: successSize,
  }
  const greatZone: HitZone = {
    start: wrapUnit(successStart + greatInset),
    size: greatSize,
  }

  return { successZone, greatZone }
}

export function createAttemptConfig(
  modeId: ModeId,
  settings: GameSettings,
  attemptId: number,
  startedAt: number,
): AttemptConfig {
  const mode = modeDefinitions[modeId]
  const { successZone, greatZone } = createZonePair(mode, settings)

  return {
    attemptId,
    modeId,
    modeName: mode.name,
    startedAt,
    successZone,
    greatZone,
    speedTurnsPerSecond: clamp(
      mode.baseSpeedTurnsPerSecond * settings.speedScale * randomVariance(mode.speedVariance),
      0.18,
      1.65,
    ),
    direction: resolveDirection(mode.direction),
    jitterStrength: mode.jitterStrength,
    visualAids: settings.visualAids || modeId === 'zen',
    scoreMultiplier: mode.scoreMultiplier,
  }
}
