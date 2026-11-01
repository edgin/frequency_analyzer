export type FilterType = 'feedforward' | 'feedback'

export type SignalType = 'sine' | 'sawtooth' | 'noise' | 'impulse'

export type PresetMode = 'mono' | 'stereo'

export interface ExplorerParams {
  mode: PresetMode
  filterType: FilterType
  delayLeftMs: number
  delayRightMs: number
  feedback: number
  dryWet: number
  signalType: SignalType
  inputFreq: number
}

export interface Preset extends ExplorerParams {
  id: string
  userId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface AudioRender {
  id: string
  presetId: string
  userId: string
  storagePath: string
  durationSeconds: number
  sampleRate: number
  createdAt: string
}

export interface PresetInput {
  name: string
  description: string | null
  params: ExplorerParams
}

export interface BuiltinPreset {
  id: string
  name: string
  description: string
  params: ExplorerParams
}
