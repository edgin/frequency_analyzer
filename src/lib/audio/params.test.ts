import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PARAMS,
  clampDelayMs,
  clampDryWet,
  clampFeedback,
  clampInputFreq,
  sanitizeParams,
} from './params'

describe('parameter clamping', () => {
  it('clamps delay time to 1–50 ms', () => {
    expect(clampDelayMs(-5)).toBe(1)
    expect(clampDelayMs(0.4)).toBe(1)
    expect(clampDelayMs(12.5)).toBe(12.5)
    expect(clampDelayMs(80)).toBe(50)
    expect(clampDelayMs(Number.NaN)).toBe(1)
  })

  it('clamps feedback to 0–0.98', () => {
    expect(clampFeedback(-0.1)).toBe(0)
    expect(clampFeedback(0.95)).toBe(0.95)
    expect(clampFeedback(1)).toBe(0.98)
  })

  it('clamps dry/wet and input frequency', () => {
    expect(clampDryWet(2)).toBe(1)
    expect(clampDryWet(-1)).toBe(0)
    expect(clampInputFreq(20)).toBe(50)
    expect(clampInputFreq(4000)).toBe(1000)
  })
})

describe('sanitizeParams', () => {
  it('returns defaults for empty input', () => {
    expect(sanitizeParams(null)).toEqual(DEFAULT_PARAMS)
  })

  it('rejects invalid enum values', () => {
    const result = sanitizeParams({
      mode: 'quadraphonic' as never,
      filterType: 'magic' as never,
      signalType: 'flute' as never,
    })
    expect(result.mode).toBe(DEFAULT_PARAMS.mode)
    expect(result.filterType).toBe(DEFAULT_PARAMS.filterType)
    expect(result.signalType).toBe(DEFAULT_PARAMS.signalType)
  })

  it('clamps numeric values from stored data', () => {
    const result = sanitizeParams({
      delayLeftMs: 999,
      delayRightMs: 0,
      feedback: 1,
      dryWet: 3,
      inputFreq: 5,
    })
    expect(result.delayLeftMs).toBe(50)
    expect(result.delayRightMs).toBe(1)
    expect(result.feedback).toBe(0.98)
    expect(result.dryWet).toBe(1)
    expect(result.inputFreq).toBe(50)
  })
})
