export type ModeId = 'standard' | 'decisive' | 'hex' | 'chaos' | 'zen'

export type HitGrade = 'great' | 'success' | 'fail' | 'timeout'

export type RotationDirection = -1 | 1

export interface HitZone {
  start: number
  size: number
}

export interface SkillCheckLayout {
  centerX: number
  centerY: number
  radius: number
}

export interface Keybind {
  code: string
  label: string
}

export interface GameSettings {
  speedScale: number
  zoneScale: number
  volume: number
  keybind: Keybind
  timingGuide: boolean
  roundDurationSeconds: number
}

export interface ModeDefinition {
  id: ModeId
  name: string
  accent: string
  baseSpeedTurnsPerSecond: number
  successZoneSize: number
  greatZoneSize: number
  direction: RotationDirection | 'random'
  jitterStrength: number
  speedVariance: number
  zoneVariance: number
  scoreMultiplier: number
}

export interface AttemptConfig {
  attemptId: number
  modeId: ModeId
  modeName: string
  startedAt: number
  successZone: HitZone
  greatZone: HitZone
  speedTurnsPerSecond: number
  direction: RotationDirection
  jitterStrength: number
  timingGuide: boolean
  scoreMultiplier: number
}

export interface AttemptResult {
  attemptId: number
  modeId: ModeId
  grade: HitGrade
  reactionMs: number | null
  errorMs: number
  accuracy: number
  scoreDelta: number
  timestamp: number
}

export interface ModeStats {
  attempts: number
  successes: number
  greats: number
  fails: number
  bestStreak: number
  averageReactionMs: number | null
  averageAccuracy: number
}

export interface GameStats {
  score: number
  streak: number
  bestStreak: number
  attempts: number
  successes: number
  greats: number
  fails: number
  averageReactionMs: number | null
  averageAccuracy: number
  byMode: Record<ModeId, ModeStats>
}

export interface LeaderboardEntry {
  id: string
  modeId: ModeId
  score: number
  attempts: number
  greats: number
  successRate: number
  elapsedMs: number
  createdAt: number
}
