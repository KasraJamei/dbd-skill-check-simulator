export function formatMs(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '--'
  }

  return `${Math.round(value)} ms`
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function formatSignedMs(value: number) {
  const roundedValue = Math.round(value)

  if (roundedValue > 0) {
    return `+${roundedValue} ms`
  }

  return `${roundedValue} ms`
}

export function formatClock(ms: number) {
  const safeMs = Math.max(0, ms)
  const totalSeconds = Math.ceil(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
