import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EducationPanel } from '../components/education/EducationPanel'
import { PageHeader } from '../components/layout/PageHeader'
import { ResponseGraph, type GraphCurve } from '../components/graph/ResponseGraph'
import { SavePresetDialog } from '../components/presets/SavePresetDialog'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Slider } from '../components/ui/Slider'
import { DelayResonanceEngine } from '../lib/audio/engine'
import {
  DEFAULT_PARAMS,
  clampDelayMs,
  clampDryWet,
  clampFeedback,
  clampInputFreq,
  sanitizeParams,
} from '../lib/audio/params'
import {
  firstResonanceFrequencies,
  peakGain,
  spacingHz,
  toDb,
} from '../lib/audio/response'
import { useAuth } from '../lib/auth/useAuth'
import { formatDb, formatHz, formatMs, formatPercent } from '../lib/format'
import { BUILTIN_PRESETS, FILTER_LABELS, SIGNAL_LABELS } from '../lib/presets'
import type { BuiltinPreset, FilterType, ExplorerParams, PresetMode, SignalType, Preset } from '../types'

const DRAFT_KEY = 'dre:explorer-draft'
const RESUME_SAVE_KEY = 'dre:resume-save'

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">{title}</h2>
      {hint ? <span className="text-[11px] text-mist/70">{hint}</span> : null}
    </div>
  )
}

function PeaksList({
  label,
  delayMs,
  color,
}: {
  label: string
  delayMs: number
  color: string
}) {
  const peaks = firstResonanceFrequencies(delayMs)
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-mist">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        {label}
      </div>
      <ol className="grid grid-cols-5 gap-1">
        {peaks.map((frequency, index) => (
          <li
            key={`${label}-${frequency}`}
            className="rounded-md border border-line bg-charcoal-950/60 px-1 py-1 text-center"
          >
            <span className="readout block text-[11px] text-white">{frequency.toFixed(1)}</span>
            <span className="block text-[10px] text-mist/70">{index + 1}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface ExplorerBootstrap {
  params: ExplorerParams
  saveOpen: boolean
  notice: string | null
}

function readBootstrap(locationState: unknown): ExplorerBootstrap {
  const state = locationState as { preset?: Partial<ExplorerParams> } | null
  if (state?.preset) {
    return {
      params: sanitizeParams(state.preset),
      saveOpen: false,
      notice: 'Loaded preset from your library.',
    }
  }

  let draft: ExplorerParams | null = null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (raw) draft = sanitizeParams(JSON.parse(raw) as Partial<ExplorerParams>)
  } catch {
    // Ignore malformed drafts.
  }

  const resumeSave = window.sessionStorage.getItem(RESUME_SAVE_KEY) === '1'
  return {
    params: draft ?? DEFAULT_PARAMS,
    saveOpen: resumeSave,
    notice: resumeSave
      ? 'Your settings were restored. Name the preset to save it.'
      : draft
        ? 'Restored your unsaved settings.'
        : null,
  }
}

export default function Explore() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [bootstrap] = useState(() => readBootstrap(location.state))
  const [engine] = useState(() => new DelayResonanceEngine(bootstrap.params))
  const [params, setParams] = useState<ExplorerParams>(bootstrap.params)
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(bootstrap.saveOpen)
  const [notice, setNotice] = useState<string | null>(bootstrap.notice)

  useEffect(() => {
    window.sessionStorage.removeItem(DRAFT_KEY)
    window.sessionStorage.removeItem(RESUME_SAVE_KEY)
  }, [])

  useEffect(() => {
    engine.update(params)
  }, [engine, params])

  useEffect(() => {
    return () => {
      void engine.dispose()
    }
  }, [engine])

  const update = <K extends keyof ExplorerParams,>(key: K, value: ExplorerParams[K]) => {
    setParams((current) => ({ ...current, [key]: value }))
  }

  const applyBuiltin = (preset: BuiltinPreset) => {
    setParams(sanitizeParams(preset.params))
    setNotice(`Loaded “${preset.name}”.`)
  }

  const handlePlayToggle = async () => {
    setAudioError(null)
    if (running) {
      engine.stop()
      setRunning(false)
      return
    }

    setBusy(true)
    try {
      await engine.start()
      setRunning(true)
    } catch (caught) {
      setAudioError(caught instanceof Error ? caught.message : 'Could not start audio.')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveClick = () => {
    setNotice(null)
    if (user) {
      setSaveOpen(true)
      return
    }
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(params))
    window.sessionStorage.setItem(RESUME_SAVE_KEY, '1')
    navigate('/login', { state: { from: '/', reason: 'save' } })
  }

  const handleSaved = (preset: Preset) => {
    setNotice(`Saved “${preset.name}” to your library.`)
  }

  const spacing = spacingHz(params.delayLeftMs)
  const leftPeaks = firstResonanceFrequencies(params.delayLeftMs)
  const peakDb = toDb(peakGain(params.filterType, params.feedback))
  const isOscillator = params.signalType === 'sine' || params.signalType === 'sawtooth'

  const curves: GraphCurve[] =
    params.mode === 'stereo'
      ? [
          {
            key: 'left',
            label: `Left · ${formatMs(params.delayLeftMs)}`,
            delayMs: params.delayLeftMs,
            color: '#22d3ee',
          },
          {
            key: 'right',
            label: `Right · ${formatMs(params.delayRightMs)}`,
            delayMs: params.delayRightMs,
            color: '#f59e0b',
          },
        ]
      : [
          {
            key: 'mono',
            label: `Mono · ${formatMs(params.delayLeftMs)}`,
            delayMs: params.delayLeftMs,
            color: '#22d3ee',
          },
        ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        eyebrow="Interactive lab"
        title="Delay Resonance Explorer"
        description="Move the delay slider and watch the comb-filter peaks move. Press Play to hear the delay loop and its metallic ringing."
        actions={
          <>
            <button
              type="button"
              className={`btn ${running ? 'btn-danger' : 'btn-primary'}`}
              onClick={handlePlayToggle}
              disabled={busy}
            >
              {busy ? 'Starting…' : running ? 'Stop audio' : 'Play audio'}
            </button>
            <button type="button" className="btn" onClick={handleSaveClick}>
              Save preset
            </button>
          </>
        }
      />

      {notice ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-glow/25 bg-cyan-glow/5 px-3 py-2 text-xs text-cyan-100">
          <span>{notice}</span>
          <Link to="/presets" className="font-semibold text-cyan-glow hover:underline">
            Open preset library
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <section className="panel p-4 sm:p-5">
            <SectionTitle
              title="Frequency response"
              hint={`${FILTER_LABELS[params.filterType]} · ${params.mode}`}
            />

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-line bg-charcoal-950/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Delay</p>
                <p className="readout mt-1 text-xl text-white">{formatMs(params.delayLeftMs)}</p>
              </div>
              <div className="rounded-lg border border-line bg-charcoal-950/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Spacing</p>
                <p className="readout mt-1 text-xl text-white">{formatHz(spacing, 2)}</p>
              </div>
              <div className="rounded-lg border border-line bg-charcoal-950/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Feedback</p>
                <p className="readout mt-1 text-xl text-white">
                  {formatPercent(params.feedback, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-charcoal-950/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Peak gain</p>
                <p className="readout mt-1 text-xl text-white">{formatDb(peakDb)}</p>
              </div>
            </div>

            <ResponseGraph
              curves={curves}
              filterType={params.filterType}
              feedback={params.feedback}
            />

            <div className="mt-5 space-y-4 border-t border-line pt-4">
              <PeaksList
                label={params.mode === 'stereo' ? 'Left · first five peaks' : 'First five peaks'}
                delayMs={params.delayLeftMs}
                color="#22d3ee"
              />
              {params.mode === 'stereo' ? (
                <PeaksList
                  label={`Right · first five peaks`}
                  delayMs={params.delayRightMs}
                  color="#f59e0b"
                />
              ) : null}
              <p className="text-xs leading-relaxed text-mist/80">
                These are peaks of an ideal delay system — the spacing is{' '}
                <span className="readout text-mist">f = 1000 / delay ms</span> — not necessarily the
                pitch of the incoming sound. The first five non-zero peaks at{' '}
                {formatMs(params.delayLeftMs)} are{' '}
                {leftPeaks.map((frequency) => `${frequency.toFixed(1)} Hz`).join(', ')}.
              </p>
            </div>
          </section>

          <EducationPanel />
        </div>

        <div className="space-y-4">
          <section className="panel p-4 sm:p-5">
            <SectionTitle title="Filter & delay" />
            <div className="space-y-4">
              <SegmentedControl<FilterType>
                label="Filter mode"
                value={params.filterType}
                onChange={(value) => update('filterType', value)}
                options={[
                  { value: 'feedforward', label: 'Feedforward' },
                  { value: 'feedback', label: 'Feedback' },
                ]}
                hint={
                  params.filterType === 'feedback'
                    ? 'Feedback recirculates the delay: stronger, narrower resonances and longer ringing.'
                    : 'Feedforward mixes one delayed copy with the dry signal: peaks at k / T.'
                }
              />

              <SegmentedControl<PresetMode>
                label="Channels"
                value={params.mode}
                onChange={(value) => update('mode', value)}
                options={[
                  { value: 'mono', label: 'Mono' },
                  { value: 'stereo', label: 'Stereo' },
                ]}
              />

              <Slider
                label={params.mode === 'stereo' ? 'Left delay' : 'Delay time'}
                value={params.delayLeftMs}
                min={1}
                max={50}
                step={0.1}
                onChange={(value) => update('delayLeftMs', clampDelayMs(value))}
                formatValue={(value) => formatMs(value, 1)}
                accent="#22d3ee"
                hint="1–50 ms. Shorter delays space the resonances further apart."
              />

              {params.mode === 'stereo' ? (
                <Slider
                  label="Right delay"
                  value={params.delayRightMs}
                  min={1}
                  max={50}
                  step={0.1}
                  onChange={(value) => update('delayRightMs', clampDelayMs(value))}
                  formatValue={(value) => formatMs(value, 1)}
                  accent="#f59e0b"
                  hint="The right channel gets its own resonance pattern."
                />
              ) : null}

              <Slider
                label={params.filterType === 'feedback' ? 'Feedback' : 'Delayed-signal gain'}
                value={params.feedback}
                min={0}
                max={0.98}
                step={0.01}
                onChange={(value) => update('feedback', clampFeedback(value))}
                formatValue={(value) => formatPercent(value, 0)}
                accent="#22d3ee"
                hint="Capped at 98% for safety. Higher feedback means louder, narrower peaks and longer decay."
              />

              <Slider
                label="Dry / wet"
                value={params.dryWet}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => update('dryWet', clampDryWet(value))}
                formatValue={(value) => formatPercent(value, 0)}
                accent="#22d3ee"
                hint="0% is fully dry, 100% is fully processed."
              />
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <SectionTitle title="Audio experiment" hint="Starts only after Play" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn flex-1 ${running ? 'btn-danger' : 'btn-primary'}`}
                  onClick={handlePlayToggle}
                  disabled={busy}
                >
                  {busy ? 'Starting…' : running ? 'Stop' : 'Play'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => engine.retrigger()}
                  disabled={!running || params.signalType !== 'impulse'}
                >
                  Trigger
                </button>
              </div>

              <div>
                <label
                  htmlFor="signal-type"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
                >
                  Test signal
                </label>
                <select
                  id="signal-type"
                  className="field"
                  value={params.signalType}
                  onChange={(event) => update('signalType', event.target.value as SignalType)}
                >
                  {(Object.keys(SIGNAL_LABELS) as SignalType[]).map((signal) => (
                    <option key={signal} value={signal}>
                      {SIGNAL_LABELS[signal]}
                    </option>
                  ))}
                </select>
              </div>

              {isOscillator ? (
                <Slider
                  label="Input frequency"
                  value={params.inputFreq}
                  min={50}
                  max={1000}
                  step={1}
                  onChange={(value) => update('inputFreq', clampInputFreq(value))}
                  formatValue={(value) => `${value.toFixed(0)} Hz`}
                  accent="#22d3ee"
                  hint="Sweeping the oscillator lets you hear each resonance peak pass by."
                />
              ) : (
                <p className="rounded-lg border border-line bg-charcoal-950/60 p-3 text-xs text-mist">
                  {params.signalType === 'noise'
                    ? 'White noise excites every frequency at once, so the comb pattern is easy to hear.'
                    : 'The impulse excites the resonance and then lets you hear the feedback tail. Use Trigger to repeat it.'}
                </p>
              )}

              {audioError ? (
                <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                  {audioError}
                </p>
              ) : null}

              <p className="text-xs leading-relaxed text-mist/80">
                Headphones recommended. The engine uses a real feedback loop, a limiter and a
                conservative master gain. The graph above is theoretical; the audio also depends on
                dry/wet and the source.
              </p>
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <SectionTitle title="Built-in presets" />
            <div className="grid gap-2">
              {BUILTIN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-lg border border-line bg-charcoal-950/50 px-3 py-2 text-left transition-colors hover:border-cyan-glow/40 hover:bg-charcoal-800"
                  onClick={() => applyBuiltin(preset)}
                >
                  <span className="block text-sm font-medium text-white">{preset.name}</span>
                  <span className="mt-0.5 block text-[11px] text-mist">
                    {preset.params.mode === 'stereo'
                      ? `L ${formatMs(preset.params.delayLeftMs)} · R ${formatMs(preset.params.delayRightMs)}`
                      : formatMs(preset.params.delayLeftMs)}{' '}
                    · {formatPercent(preset.params.feedback, 0)} feedback
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <SectionTitle title="Your library" />
            <p className="text-xs leading-relaxed text-mist">
              {user
                ? 'Save the current settings with a name and optional description, then add an audio snapshot from the save dialog.'
                : 'Log in to save presets and audio snapshots. Your current settings will be kept while you sign in.'}
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-primary flex-1" onClick={handleSaveClick}>
                {user ? 'Save current preset' : 'Log in to save'}
              </button>
              <Link to="/presets" className="btn">
                Library
              </Link>
            </div>
          </section>
        </div>
      </div>

      {saveOpen ? (
        <SavePresetDialog
          open
          params={params}
          onClose={() => setSaveOpen(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  )
}
