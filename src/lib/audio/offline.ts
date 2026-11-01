import type { ExplorerParams } from '../../types'
import { MASTER_GAIN, createEffectGraph } from './graph'
import { createTestSource } from './sources'
import { encodeWav } from './wav'

export interface RenderedSnapshot {
  blob: Blob
  durationSeconds: number
  sampleRate: number
}

export async function renderSnapshot(
  params: ExplorerParams,
  durationSeconds = 8,
  sampleRate = 44100,
): Promise<RenderedSnapshot> {
  const frameCount = Math.ceil(durationSeconds * sampleRate)
  const context = new OfflineAudioContext(2, frameCount, sampleRate)
  const graph = createEffectGraph(context, params)
  graph.master.connect(context.destination)

  graph.master.gain.setValueAtTime(0, 0)
  graph.master.gain.linearRampToValueAtTime(MASTER_GAIN, 0.04)
  graph.master.gain.setValueAtTime(MASTER_GAIN, Math.max(0.05, durationSeconds - 0.1))
  graph.master.gain.linearRampToValueAtTime(0, Math.max(0.06, durationSeconds - 0.01))

  const source = createTestSource(context, params.signalType, params.inputFreq, graph.input)
  source.start(0)

  if (params.signalType === 'impulse') {
    for (let time = 1.5; time < durationSeconds - 0.4; time += 1.5) {
      source.retrigger(time)
    }
  }

  const buffer = await context.startRendering()
  graph.dispose()

  return {
    blob: encodeWav(buffer),
    durationSeconds: buffer.duration,
    sampleRate: buffer.sampleRate,
  }
}
