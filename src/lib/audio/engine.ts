import type { ExplorerParams } from '../../types'
import { type EffectGraph, MASTER_GAIN, createEffectGraph } from './graph'
import { type SourceHandle, createTestSource } from './sources'

export class DelayResonanceEngine {
  private context: AudioContext | null = null
  private graph: EffectGraph | null = null
  private source: SourceHandle | null = null
  private params: ExplorerParams
  private running = false

  constructor(params: ExplorerParams) {
    this.params = params
  }

  get isRunning(): boolean {
    return this.running
  }

  async start(): Promise<void> {
    if (this.running) return

    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' })
    }
    const context = this.context
    if (context.state === 'suspended') {
      await context.resume()
    }

    const graph = createEffectGraph(context, this.params)
    graph.master.connect(context.destination)

    const now = context.currentTime
    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(0, now)
    graph.master.gain.linearRampToValueAtTime(MASTER_GAIN, now + 0.04)

    const source = createTestSource(
      context,
      this.params.signalType,
      this.params.inputFreq,
      graph.input,
    )
    source.start(now)

    this.graph = graph
    this.source = source
    this.running = true
  }

  stop(): void {
    if (!this.running || !this.context || !this.graph) return
    const context = this.context
    const graph = this.graph
    const source = this.source
    const now = context.currentTime
    this.running = false
    this.graph = null
    this.source = null

    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(graph.master.gain.value, now)
    graph.master.gain.linearRampToValueAtTime(0, now + 0.06)
    source?.stop(now + 0.06)
    window.setTimeout(() => graph.dispose(), 220)
  }

  update(next: ExplorerParams): void {
    const previous = this.params
    this.params = next

    if (!this.running || !this.context || !this.graph) return

    if (next.mode !== previous.mode) {
      this.rebuildGraph()
      return
    }

    this.graph.update(next)

    if (next.signalType !== previous.signalType) {
      this.swapSource()
      return
    }

    this.source?.setFrequency(next.inputFreq)
  }

  retrigger(): void {
    if (!this.running) return
    this.source?.retrigger()
  }

  get canRetrigger(): boolean {
    return Boolean(this.source?.retriggerable)
  }

  async dispose(): Promise<void> {
    this.stop()
    if (this.context) {
      const context = this.context
      this.context = null
      await context.close()
    }
  }

  private rebuildGraph(): void {
    if (!this.context || !this.graph) return
    const context = this.context
    const previousGraph = this.graph
    const previousSource = this.source
    const now = context.currentTime

    const graph = createEffectGraph(context, this.params)
    graph.master.connect(context.destination)
    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(0, now)
    graph.master.gain.linearRampToValueAtTime(MASTER_GAIN, now + 0.04)

    const source = createTestSource(
      context,
      this.params.signalType,
      this.params.inputFreq,
      graph.input,
    )
    source.start(now)

    previousGraph.master.gain.cancelScheduledValues(now)
    previousGraph.master.gain.setValueAtTime(previousGraph.master.gain.value, now)
    previousGraph.master.gain.linearRampToValueAtTime(0, now + 0.04)
    previousSource?.stop(now + 0.05)
    window.setTimeout(() => previousGraph.dispose(), 220)

    this.graph = graph
    this.source = source
  }

  private swapSource(): void {
    if (!this.context || !this.graph) return
    const context = this.context
    const graph = this.graph
    const now = context.currentTime
    this.source?.stop(now + 0.02)

    const source = createTestSource(
      context,
      this.params.signalType,
      this.params.inputFreq,
      graph.input,
    )
    source.start(now + 0.02)
    this.source = source
  }
}
