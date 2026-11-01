import type { ExplorerParams, FilterType, PresetMode, SignalType } from '../../types'

export const LIMITS = {
  delayMs: { min: 1, max: 50 },
  feedback: { min: 0, max: 0.98 },
  dryWet: { min: 0, max: 1 },
  inputFreq: { min: 50, max: 1000 },
} as const

export const DEFAULT_PARAMS: ExplorerParams = {
  mode: 'mono',
  filterType: 'feedback',
  delayLeftMs: 10,
  delayRightMs: 15,
  feedback: 0.95,
  dryWet: 0.4,
  signalType: 'sine',
  inputFreq: 220,
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function clampDelayMs(value: number): number {
  return clamp(value, LIMITS.delayMs.min, LIMITS.delayMs.max)
}

export function clampFeedback(value: number): number {
  return clamp(value, LIMITS.feedback.min, LIMITS.feedback.max)
}

export function clampDryWet(value: number): number {
  return clamp(value, LIMITS.dryWet.min, LIMITS.dryWet.max)
}

export function clampInputFreq(value: number): number {
  return clamp(value, LIMITS.inputFreq.min, LIMITS.inputFreq.max)
}

const FILTER_TYPES: FilterType[] = ['feedforward', 'feedback']
const SIGNAL_TYPES: SignalType[] = ['sine', 'sawtooth', 'noise', 'impulse']
const MODES: PresetMode[] = ['mono', 'stereo']

export function sanitizeParams(input: Partial<ExplorerParams> | null | undefined): ExplorerParams {
  const source = input ?? {}
  return {
    mode: MODES.includes(source.mode as PresetMode) ? (source.mode as PresetMode) : DEFAULT_PARAMS.mode,
    filterType: FILTER_TYPES.includes(source.filterType as FilterType)
      ? (source.filterType as FilterType)
      : DEFAULT_PARAMS.filterType,
    delayLeftMs: clampDelayMs(source.delayLeftMs ?? DEFAULT_PARAMS.delayLeftMs),
    delayRightMs: clampDelayMs(source.delayRightMs ?? DEFAULT_PARAMS.delayRightMs),
    feedback: clampFeedback(source.feedback ?? DEFAULT_PARAMS.feedback),
    dryWet: clampDryWet(source.dryWet ?? DEFAULT_PARAMS.dryWet),
    signalType: SIGNAL_TYPES.includes(source.signalType as SignalType)
      ? (source.signalType as SignalType)
      : DEFAULT_PARAMS.signalType,
    inputFreq: clampInputFreq(source.inputFreq ?? DEFAULT_PARAMS.inputFreq),
  }
}
