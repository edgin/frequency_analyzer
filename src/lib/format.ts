export function formatMs(value: number, digits = 1): string {
  return `${value.toFixed(digits)} ms`
}

export function formatHz(value: number, digits = 1): string {
  return `${value.toFixed(digits)} Hz`
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`
}

export function formatDb(value: number): string {
  if (!Number.isFinite(value)) return '+∞ dB'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)} dB`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
