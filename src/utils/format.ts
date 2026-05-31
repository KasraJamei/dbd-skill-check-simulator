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
