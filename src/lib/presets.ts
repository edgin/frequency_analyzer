import type { BuiltinPreset, ExplorerParams, FilterType, Preset, PresetMode, SignalType } from '../types'
import { DEFAULT_PARAMS, sanitizeParams } from './audio/params'

export const SIGNAL_LABELS: Record<SignalType, string> = {
  sine: 'Sine wave',
  sawtooth: 'Sawtooth',
  noise: 'White noise',
  impulse: 'Impulse',
}

export const FILTER_LABELS: Record<FilterType, string> = {
  feedforward: 'Feedforward',
  feedback: 'Feedback',
}

export const MODE_LABELS: Record<PresetMode, string> = {
  mono: 'Mono',
  stereo: 'Stereo',
}

export const BUILTIN_PRESETS: BuiltinPreset[] = [
  {
    id: 'metallic-ring',
    name: 'Metallic Ring',
    description: 'A very short delay with high feedback — bright, bell-like ringing.',
    params: {
      ...DEFAULT_PARAMS,
      delayLeftMs: 3,
      delayRightMs: 3,
      feedback: 0.97,
      dryWet: 0.45,
    },
  },
  {
    id: 'harmonic-resonance',
    name: 'Harmonic Resonance',
    description: '10 ms produces resonance peaks every 100 Hz — the reference setting.',
    params: {
      ...DEFAULT_PARAMS,
      delayLeftMs: 10,
      delayRightMs: 10,
      feedback: 0.95,
      dryWet: 0.4,
    },
  },
  {
    id: 'deep-resonance',
    name: 'Deep Resonance',
    description: '20 ms spacing produces a darker, lower harmonic series.',
    params: {
      ...DEFAULT_PARAMS,
      delayLeftMs: 20,
      delayRightMs: 20,
      feedback: 0.96,
      dryWet: 0.5,
    },
  },
  {
    id: 'short-echo',
    name: 'Short Echo',
    description: '50 ms is long enough to hear as a distinct slap-back echo.',
    params: {
      ...DEFAULT_PARAMS,
      delayLeftMs: 50,
      delayRightMs: 50,
      feedback: 0.55,
      dryWet: 0.35,
    },
  },
  {
    id: 'ableton-stereo',
    name: 'Ableton-inspired Stereo',
    description: 'Left 10 ms and right 15 ms create interleaved resonance patterns.',
    params: {
      ...DEFAULT_PARAMS,
      mode: 'stereo',
      delayLeftMs: 10,
      delayRightMs: 15,
      feedback: 0.95,
      dryWet: 0.4,
    },
  },
]

export function presetToParams(preset: Preset): ExplorerParams {
  return sanitizeParams({
    mode: preset.mode,
    filterType: preset.filterType,
    delayLeftMs: preset.delayLeftMs,
    delayRightMs: preset.delayRightMs,
    feedback: preset.feedback,
    dryWet: preset.dryWet,
    signalType: preset.signalType,
    inputFreq: preset.inputFreq,
  })
}
