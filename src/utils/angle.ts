import type { HitZone } from '../types/game'

export const TAU = Math.PI * 2

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function wrapUnit(value: number) {
  return ((value % 1) + 1) % 1
}

export function turnToRadians(turn: number) {
  return wrapUnit(turn) * TAU - Math.PI / 2
}

export function zoneEnd(zone: HitZone) {
  return wrapUnit(zone.start + zone.size)
}

export function zoneCenter(zone: HitZone) {
  return wrapUnit(zone.start + zone.size / 2)
}

export function isAngleInZone(angle: number, zone: HitZone) {
  const normalizedAngle = wrapUnit(angle)
  const normalizedStart = wrapUnit(zone.start)
  const normalizedEnd = zoneEnd(zone)

  if (zone.size >= 1) {
    return true
  }

  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd
}

export function signedTurnDistance(from: number, to: number) {
  const rawDistance = wrapUnit(to) - wrapUnit(from)

  if (rawDistance > 0.5) {
    return rawDistance - 1
  }

  if (rawDistance < -0.5) {
    return rawDistance + 1
  }

  return rawDistance
}

export function turnDistance(from: number, to: number) {
  return Math.abs(signedTurnDistance(from, to))
}
