import { describe, expect, it } from 'vitest'
import {
  DB_CEILING,
  DB_FLOOR,
  feedbackMagnitude,
  feedforwardMagnitude,
  firstResonanceFrequencies,
  nearestPeak,
  peakGain,
  responseDb,
  spacingHz,
  toDb,
} from './response'

describe('resonance spacing', () => {
  it('is 100 Hz at 10 ms', () => {
    expect(spacingHz(10)).toBeCloseTo(100, 10)
  })

  it('is 333.33 Hz at 3 ms', () => {
    expect(spacingHz(3)).toBeCloseTo(333.333, 2)
  })

  it('returns the first five non-zero peaks at 10 ms', () => {
    expect(firstResonanceFrequencies(10)).toEqual([100, 200, 300, 400, 500])
  })
})

describe('feedforward comb filter', () => {
  const gain = 0.95
  const delayMs = 10

  it('peaks at multiples of 1/T', () => {
    expect(feedforwardMagnitude(0, gain, delayMs)).toBeCloseTo(1 + gain, 10)
    expect(feedforwardMagnitude(100, gain, delayMs)).toBeCloseTo(1 + gain, 10)
    expect(feedforwardMagnitude(200, gain, delayMs)).toBeCloseTo(1 + gain, 10)
  })

  it('nulls at half-spacing offsets', () => {
    expect(feedforwardMagnitude(50, gain, delayMs)).toBeCloseTo(1 - gain, 10)
    expect(feedforwardMagnitude(150, gain, delayMs)).toBeCloseTo(1 - gain, 10)
  })

  it('converts the peak and null to dB', () => {
    expect(responseDb(100, 'feedforward', gain, delayMs)).toBeCloseTo(5.8, 1)
    expect(responseDb(50, 'feedforward', gain, delayMs)).toBeCloseTo(-26.0, 1)
  })
})

describe('feedback comb filter', () => {
  const gain = 0.95
  const delayMs = 10

  it('peaks at multiples of 1/T with gain 1/(1-g)', () => {
    expect(feedbackMagnitude(100, gain, delayMs)).toBeCloseTo(20, 8)
    expect(feedbackMagnitude(200, gain, delayMs)).toBeCloseTo(20, 8)
  })

  it('attenuates at half-spacing offsets with gain 1/(1+g)', () => {
    expect(feedbackMagnitude(50, gain, delayMs)).toBeCloseTo(1 / 1.95, 8)
  })

  it('reports about +26 dB at the peak', () => {
    expect(responseDb(100, 'feedback', gain, delayMs)).toBeCloseTo(26.02, 1)
  })

  it('reports about +34 dB at g = 0.98', () => {
    expect(responseDb(100, 'feedback', 0.98, delayMs)).toBeCloseTo(33.98, 1)
  })
})

describe('display clamping', () => {
  it('clamps zero magnitude to the floor', () => {
    expect(toDb(0)).toBe(DB_FLOOR)
  })

  it('never exceeds the display ceiling', () => {
    expect(toDb(1e9)).toBe(DB_CEILING)
    expect(responseDb(100, 'feedback', 0.98, 5)).toBeLessThanOrEqual(DB_CEILING)
  })
})

describe('peak helpers', () => {
  it('computes peak gains for both filter types', () => {
    expect(peakGain('feedforward', 0.5)).toBeCloseTo(1.5, 10)
    expect(peakGain('feedback', 0.5)).toBeCloseTo(2, 10)
  })

  it('finds the nearest resonance peak', () => {
    expect(nearestPeak(103, 10)).toEqual({ frequency: 100, harmonic: 1 })
    expect(nearestPeak(149, 10)).toEqual({ frequency: 100, harmonic: 1 })
    expect(nearestPeak(151, 10)).toEqual({ frequency: 200, harmonic: 2 })
  })
})
