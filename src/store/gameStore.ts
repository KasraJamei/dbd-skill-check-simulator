import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { modeOrder } from '../modes/definitions'
import type { AttemptResult, GameSettings, GameStats, ModeId, ModeStats } from '../types/game'

interface GameStore {
  modeId: ModeId
  settings: GameSettings
  stats: GameStats
  history: AttemptResult[]
  lastResult: AttemptResult | null
  setMode: (modeId: ModeId) => void
  updateSettings: (settings: Partial<GameSettings>) => void
  recordAttempt: (result: AttemptResult) => void
  resetStats: () => void
}

const defaultSettings: GameSettings = {
  speedScale: 1,
  zoneScale: 1,
  volume: 0.72,
  keybind: {
    code: 'Space',
    label: 'Space',
  },
  visualAids: false,
}

function createEmptyModeStats(): ModeStats {
  return {
    attempts: 0,
    successes: 0,
    greats: 0,
    fails: 0,
    bestStreak: 0,
    averageReactionMs: null,
    averageAccuracy: 0,
  }
}

function createEmptyStats(): GameStats {
  return {
    score: 0,
    streak: 0,
    bestStreak: 0,
    attempts: 0,
    successes: 0,
    greats: 0,
    fails: 0,
    averageReactionMs: null,
    averageAccuracy: 0,
    byMode: modeOrder.reduce(
      (statsByMode, modeId) => ({
        ...statsByMode,
        [modeId]: createEmptyModeStats(),
      }),
      {} as Record<ModeId, ModeStats>,
    ),
  }
}

function updateAverage(currentAverage: number | null, currentCount: number, nextValue: number | null) {
  if (nextValue === null) {
    return currentAverage
  }

  if (currentAverage === null || currentCount === 0) {
    return nextValue
  }

  return (currentAverage * currentCount + nextValue) / (currentCount + 1)
}

function updateStats(stats: GameStats, result: AttemptResult): GameStats {
  const isSuccess = result.grade === 'success' || result.grade === 'great'
  const nextStreak = isSuccess ? stats.streak + 1 : 0
  const currentModeStats = stats.byMode[result.modeId] ?? createEmptyModeStats()
  const nextModeStreak = isSuccess ? Math.max(currentModeStats.bestStreak, nextStreak) : currentModeStats.bestStreak
  const reactionCount = stats.averageReactionMs === null ? 0 : stats.successes
  const modeReactionCount = currentModeStats.averageReactionMs === null ? 0 : currentModeStats.successes
  const nextModeAttempts = currentModeStats.attempts + 1
  const nextModeSuccesses = currentModeStats.successes + (isSuccess ? 1 : 0)

  return {
    score: Math.max(0, stats.score + result.scoreDelta),
    streak: nextStreak,
    bestStreak: Math.max(stats.bestStreak, nextStreak),
    attempts: stats.attempts + 1,
    successes: stats.successes + (isSuccess ? 1 : 0),
    greats: stats.greats + (result.grade === 'great' ? 1 : 0),
    fails: stats.fails + (isSuccess ? 0 : 1),
    averageReactionMs: updateAverage(stats.averageReactionMs, reactionCount, result.reactionMs),
    averageAccuracy: (stats.averageAccuracy * stats.attempts + result.accuracy) / (stats.attempts + 1),
    byMode: {
      ...stats.byMode,
      [result.modeId]: {
        attempts: nextModeAttempts,
        successes: nextModeSuccesses,
        greats: currentModeStats.greats + (result.grade === 'great' ? 1 : 0),
        fails: currentModeStats.fails + (isSuccess ? 0 : 1),
        bestStreak: nextModeStreak,
        averageReactionMs: updateAverage(currentModeStats.averageReactionMs, modeReactionCount, result.reactionMs),
        averageAccuracy:
          (currentModeStats.averageAccuracy * currentModeStats.attempts + result.accuracy) / nextModeAttempts,
      },
    },
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      modeId: 'standard',
      settings: defaultSettings,
      stats: createEmptyStats(),
      history: [],
      lastResult: null,
      setMode: (modeId) => set({ modeId, lastResult: null }),
      updateSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
      recordAttempt: (result) =>
        set((state) => ({
          stats: updateStats(state.stats, result),
          history: [result, ...state.history].slice(0, 9),
          lastResult: result,
        })),
      resetStats: () =>
        set({
          stats: createEmptyStats(),
          history: [],
          lastResult: null,
        }),
    }),
    {
      name: 'dbd-skill-check-simulator-v1',
      version: 1,
      partialize: (state) => ({
        modeId: state.modeId,
        settings: state.settings,
        stats: state.stats,
        history: state.history,
        lastResult: state.lastResult,
      }),
    },
  ),
)
