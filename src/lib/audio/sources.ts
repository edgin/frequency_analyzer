import type { SignalType } from '../../types'

export interface SourceHandle {
  start: (when?: number) => void
  stop: (when?: number) => void
  retrigger: (when?: number) => void
  setFrequency: (frequency: number) => void
  retriggerable: boolean
}

function createNoiseBuffer(context: BaseAudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }
  return buffer
}

function createImpulseBuffer(context: BaseAudioContext, seconds = 0.5): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    const time = index / context.sampleRate
    const envelope = Math.exp(-time * 26)
    data[index] = (Math.random() * 2 - 1) * envelope * 0.8
  }
  data[0] = 1
  return buffer
}

function noop(): void {
  // Intentionally empty: noise and sine sources cannot be retriggered.
}

export function createTestSource(
  context: BaseAudioContext,
  signalType: SignalType,
  frequency: number,
  destination: AudioNode,
): SourceHandle {
  if (signalType === 'sine' || signalType === 'sawtooth') {
    const oscillator = context.createOscillator()
    oscillator.type = signalType
    oscillator.frequency.setValueAtTime(frequency, 0)
    oscillator.connect(destination)
    let started = false

    return {
      start: (when = context.currentTime) => {
        if (started) return
        oscillator.start(when)
        started = true
      },
      stop: (when = context.currentTime) => {
        if (!started) return
        try {
          oscillator.stop(when)
        } catch {
          // Already stopped.
        }
      },
      retrigger: noop,
      setFrequency: (next: number) => {
        oscillator.frequency.setTargetAtTime(next, context.currentTime, 0.01)
      },
      retriggerable: false,
    }
  }

  if (signalType === 'noise') {
    const source = context.createBufferSource()
    source.buffer = createNoiseBuffer(context)
    source.loop = true
    source.connect(destination)
    let started = false

    return {
      start: (when = context.currentTime) => {
        if (started) return
        source.start(when)
        started = true
      },
      stop: (when = context.currentTime) => {
        if (!started) return
        try {
          source.stop(when)
        } catch {
          // Already stopped.
        }
      },
      retrigger: noop,
      setFrequency: noop,
      retriggerable: false,
    }
  }

  const impulse = createImpulseBuffer(context)
  const active = new Set<AudioBufferSourceNode>()

  const trigger = (when = context.currentTime): void => {
    const source = context.createBufferSource()
    source.buffer = impulse
    source.connect(destination)
    source.onended = () => {
      active.delete(source)
      source.disconnect()
    }
    active.add(source)
    source.start(when)
  }

  return {
    start: (when = context.currentTime) => trigger(when),
    stop: (when = context.currentTime) => {
      for (const source of active) {
        try {
          source.stop(when)
        } catch {
          // Already stopped.
        }
      }
      active.clear()
    },
    retrigger: trigger,
    setFrequency: noop,
    retriggerable: true,
  }
}
