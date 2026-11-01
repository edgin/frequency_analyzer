import type { FilterType } from '../../types'
import { clamp } from './params'

export const DB_CEILING = 36
export const DB_FLOOR = -40

export function toDb(magnitude: number): number {
  if (!Number.isFinite(magnitude) || magnitude <= 1e-6) return DB_FLOOR
  return clamp(20 * Math.log10(magnitude), DB_FLOOR, DB_CEILING)
}

export function feedforwardMagnitude(frequency: number, gain: number, delayMs: number): number {
  const delaySeconds = delayMs / 1000
  const phase = 2 * Math.PI * frequency * delaySeconds
  return Math.sqrt(1 + gain * gain + 2 * gain * Math.cos(phase))
}

export function feedbackMagnitude(frequency: number, gain: number, delayMs: number): number {
  const delaySeconds = delayMs / 1000
  const phase = 2 * Math.PI * frequency * delaySeconds
  const denominator = Math.sqrt(1 + gain * gain - 2 * gain * Math.cos(phase))
  if (denominator <= 1e-6) return Infinity
  return 1 / denominator
}

export function responseMagnitude(
  frequency: number,
  filterType: FilterType,
  gain: number,
  delayMs: number,
): number {
  return filterType === 'feedforward'
    ? feedforwardMagnitude(frequency, gain, delayMs)
    : feedbackMagnitude(frequency, gain, delayMs)
}

export function responseDb(
  frequency: number,
  filterType: FilterType,
  gain: number,
  delayMs: number,
): number {
  return toDb(responseMagnitude(frequency, filterType, gain, delayMs))
}

export function spacingHz(delayMs: number): number {
  return 1000 / delayMs
}

export function firstResonanceFrequencies(delayMs: number, count = 5): number[] {
  const spacing = spacingHz(delayMs)
  return Array.from({ length: count }, (_, index) => (index + 1) * spacing)
}

export function peakGain(filterType: FilterType, gain: number): number {
  return filterType === 'feedforward' ? 1 + gain : 1 / Math.max(1e-6, 1 - gain)
}

export function nearestPeak(frequency: number, delayMs: number): { frequency: number; harmonic: number } {
  const spacing = spacingHz(delayMs)
  const harmonic = Math.max(0, Math.round(frequency / spacing))
  return { frequency: harmonic * spacing, harmonic }
}
