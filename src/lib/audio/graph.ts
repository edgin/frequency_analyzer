import type { ExplorerParams } from '../../types'
import { clampDelayMs, clampDryWet, clampFeedback } from './params'

const DELAY_MAX_SECONDS = 0.06
const SMOOTHING_SECONDS = 0.015
export const MASTER_GAIN = 0.22

export interface EffectGraph {
  context: BaseAudioContext
  input: GainNode
  master: GainNode
  update: (params: ExplorerParams, immediate?: boolean) => void
  dispose: () => void
}

function applyParam(
  context: BaseAudioContext,
  param: AudioParam,
  value: number,
  immediate: boolean,
): void {
  if (immediate) {
    param.cancelScheduledValues(0)
    param.setValueAtTime(value, 0)
    return
  }
  const now = context.currentTime
  param.setTargetAtTime(value, now, SMOOTHING_SECONDS)
}

interface ChannelChain {
  delay: DelayNode
  feedback: GainNode
  delayed: GainNode
}

function createChannelChain(
  context: BaseAudioContext,
  input: AudioNode,
  output: AudioNode,
  inputChannel: number,
  outputChannel: number,
): ChannelChain {
  const delay = context.createDelay(DELAY_MAX_SECONDS)
  const feedback = context.createGain()
  const delayed = context.createGain()

  input.connect(delay, inputChannel, 0)
  delay.connect(delayed)
  delayed.connect(output, 0, outputChannel)
  delay.connect(feedback)
  feedback.connect(delay)

  return { delay, feedback, delayed }
}

export function createEffectGraph(context: BaseAudioContext, params: ExplorerParams): EffectGraph {
  const input = context.createGain()
  const dry = context.createGain()
  const wet = context.createGain()
  const directWet = context.createGain()
  const sum = context.createGain()
  const limiter = context.createDynamicsCompressor()
  const master = context.createGain()

  limiter.threshold.value = -8
  limiter.knee.value = 0
  limiter.ratio.value = 20
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  master.gain.value = MASTER_GAIN

  input.connect(dry)
  input.connect(directWet)
  directWet.connect(wet)
  dry.connect(sum)
  wet.connect(sum)
  sum.connect(limiter)
  limiter.connect(master)

  const nodes: AudioNode[] = [input, dry, wet, directWet, sum, limiter, master]
  let left: ChannelChain
  let right: ChannelChain | null = null

  if (params.mode === 'stereo') {
    const splitter = context.createChannelSplitter(2)
    const merger = context.createChannelMerger(2)
    input.connect(splitter)
    left = createChannelChain(context, splitter, merger, 0, 0)
    right = createChannelChain(context, splitter, merger, 1, 1)
    merger.connect(wet)
    nodes.push(splitter, merger, left.delay, left.feedback, left.delayed, right.delay, right.feedback, right.delayed)
  } else {
    left = createChannelChain(context, input, wet, 0, 0)
    nodes.push(left.delay, left.feedback, left.delayed)
  }

  const update = (next: ExplorerParams, immediate = false): void => {
    if (next.mode !== params.mode) {
      console.warn('createEffectGraph.update ignores mode changes; rebuild instead')
    }

    const gain = clampFeedback(next.feedback)
    const feedbackTarget = next.filterType === 'feedback' ? gain : 0
    const delayedTarget = next.filterType === 'feedforward' ? gain : 1
    // Feedforward wet output is x + g·z^-T·x, so the direct copy belongs in the wet path.
    const directWetTarget = next.filterType === 'feedforward' ? 1 : 0
    const dryWet = clampDryWet(next.dryWet)

    applyParam(context, left.delay.delayTime, clampDelayMs(next.delayLeftMs) / 1000, immediate)
    applyParam(context, left.feedback.gain, feedbackTarget, immediate)
    applyParam(context, left.delayed.gain, delayedTarget, immediate)

    if (right) {
      applyParam(context, right.delay.delayTime, clampDelayMs(next.delayRightMs) / 1000, immediate)
      applyParam(context, right.feedback.gain, feedbackTarget, immediate)
      applyParam(context, right.delayed.gain, delayedTarget, immediate)
    }

    applyParam(context, directWet.gain, directWetTarget, immediate)
    applyParam(context, dry.gain, 1 - dryWet, immediate)
    applyParam(context, wet.gain, dryWet, immediate)
  }

  update(params, true)

  return {
    context,
    input,
    master,
    update,
    dispose: () => {
      for (const node of nodes) node.disconnect()
    },
  }
}
