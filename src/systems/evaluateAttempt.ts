import type { AttemptConfig, AttemptResult, HitGrade } from '../types/game'
import { isAngleInZone, signedTurnDistance, turnDistance, zoneCenter } from '../utils/angle'

function scoreForGrade(grade: HitGrade, multiplier: number) {
  if (grade === 'great') {
    return Math.round(150 * multiplier)
  }

  if (grade === 'success') {
    return Math.round(100 * multiplier)
  }

  return -25
}

export function evaluateAttempt(
  config: AttemptConfig,
  angle: number,
  inputTimestamp: number,
  enteredSuccessAt: number | null,
  timedOut: boolean,
): AttemptResult {
  const greatHit = !timedOut && isAngleInZone(angle, config.greatZone)
  const successHit = !timedOut && (greatHit || isAngleInZone(angle, config.successZone))
  const grade: HitGrade = timedOut ? 'timeout' : greatHit ? 'great' : successHit ? 'success' : 'fail'
  const targetCenter = zoneCenter(config.greatZone)
  const signedErrorTurns = signedTurnDistance(targetCenter, angle)
  const errorMs = (signedErrorTurns / config.speedTurnsPerSecond) * 1000
  const maxUsefulError = config.successZone.size / 2 + config.greatZone.size
  const accuracy = Math.max(0, 100 - (turnDistance(angle, targetCenter) / maxUsefulError) * 100)
  const reactionMs = successHit && enteredSuccessAt !== null ? inputTimestamp - enteredSuccessAt : null

  return {
    attemptId: config.attemptId,
    modeId: config.modeId,
    grade,
    reactionMs,
    errorMs,
    accuracy,
    scoreDelta: scoreForGrade(grade, config.scoreMultiplier),
    timestamp: inputTimestamp,
  }
}
