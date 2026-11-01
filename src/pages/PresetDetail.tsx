import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { ResponseGraph, type GraphCurve } from '../components/graph/ResponseGraph'
import { EditPresetDialog } from '../components/presets/EditPresetDialog'
import { Loading } from '../components/ui/Loading'
import { useAuth } from '../lib/auth/useAuth'
import { formatDb, formatDateTime, formatHz, formatMs, formatPercent } from '../lib/format'
import { FILTER_LABELS, MODE_LABELS, SIGNAL_LABELS } from '../lib/presets'
import {
  createAudioUrl,
  deletePreset,
  getAudioRender,
  getPreset,
  saveAudioSnapshot,
} from '../lib/presetsApi'
import { peakGain, spacingHz, toDb } from '../lib/audio/response'
import type { AudioRender, Preset } from '../types'

export default function PresetDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [preset, setPreset] = useState<Preset | null>(null)
  const [render, setRender] = useState<AudioRender | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshotBusy, setSnapshotBusy] = useState(false)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const found = await getPreset(id)
        if (!active) return
        setPreset(found)
        if (!found) return

        const renderRow = await getAudioRender(id)
        if (!active) return
        setRender(renderRow)
        if (!renderRow) return

        try {
          const url = await createAudioUrl(renderRow.storagePath)
          if (active) setAudioUrl(url)
        } catch (caught) {
          if (active) {
            setAudioError(
              caught instanceof Error ? caught.message : 'Could not create an audio link.',
            )
          }
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Could not load the preset.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [id])

  const handleSnapshot = async () => {
    if (!preset) return
    setSnapshotBusy(true)
    setSnapshotError(null)
    try {
      const saved = await saveAudioSnapshot(preset)
      setRender(saved)
      const url = await createAudioUrl(saved.storagePath)
      setAudioUrl(url)
      setAudioError(null)
    } catch (caught) {
      setSnapshotError(caught instanceof Error ? caught.message : 'Could not render audio.')
    } finally {
      setSnapshotBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!preset) return
    const confirmed = window.confirm(
      `Delete “${preset.name}”? This also removes its audio snapshot.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    try {
      await deletePreset(preset)
      navigate('/presets', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete the preset.')
      setDeleting(false)
    }
  }

  const handleLoadInExplorer = () => {
    if (!preset) return
    navigate('/', { state: { preset } })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Loading label="Loading preset…" />
      </div>
    )
  }

  if (!preset) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="panel p-8 text-center">
          <h1 className="text-xl font-semibold text-white">Preset not found</h1>
          <p className="mt-2 text-sm text-mist">
            It may have been deleted, or it belongs to another account.
          </p>
          <Link to="/presets" className="btn btn-primary mt-5">
            Back to presets
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === preset.userId
  const spacing = spacingHz(preset.delayLeftMs)
  const peakDb = toDb(peakGain(preset.filterType, preset.feedback))

  const curves: GraphCurve[] =
    preset.mode === 'stereo'
      ? [
          {
            key: 'left',
            label: `Left · ${formatMs(preset.delayLeftMs)}`,
            delayMs: preset.delayLeftMs,
            color: '#22d3ee',
          },
          {
            key: 'right',
            label: `Right · ${formatMs(preset.delayRightMs)}`,
            delayMs: preset.delayRightMs,
            color: '#f59e0b',
          },
        ]
      : [
          {
            key: 'mono',
            label: `Mono · ${formatMs(preset.delayLeftMs)}`,
            delayMs: preset.delayLeftMs,
            color: '#22d3ee',
          },
        ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <Link to="/presets" className="mb-3 inline-block text-xs text-mist hover:text-white">
        ← All presets
      </Link>

      <PageHeader
        eyebrow="Preset detail"
        title={preset.name}
        description={preset.description || 'No description saved for this preset.'}
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={handleLoadInExplorer}>
              Load in Explorer
            </button>
            {isOwner ? (
              <>
                <button type="button" className="btn" onClick={() => setEditOpen(true)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            ) : null}
          </>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <div className="space-y-4">
          <section className="panel p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
                Frequency response
              </h2>
              <span className="text-[11px] text-mist/70">
                {FILTER_LABELS[preset.filterType]} · {MODE_LABELS[preset.mode]}
              </span>
            </div>
            <ResponseGraph
              curves={curves}
              filterType={preset.filterType}
              feedback={preset.feedback}
              className="h-[320px] sm:h-[380px]"
            />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Spacing</p>
                <p className="readout mt-1 text-lg text-white">{formatHz(spacing, 2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Peak gain</p>
                <p className="readout mt-1 text-lg text-white">{formatDb(peakDb)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Feedback</p>
                <p className="readout mt-1 text-lg text-white">
                  {formatPercent(preset.feedback, 0)}
                </p>
              </div>
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
              Saved parameters
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ['Channels', MODE_LABELS[preset.mode]],
                ['Filter', FILTER_LABELS[preset.filterType]],
                ['Left delay', formatMs(preset.delayLeftMs)],
                ['Right delay', formatMs(preset.delayRightMs)],
                ['Feedback / gain', formatPercent(preset.feedback, 0)],
                ['Dry / wet', formatPercent(preset.dryWet, 0)],
                ['Test signal', SIGNAL_LABELS[preset.signalType]],
                [
                  'Input frequency',
                  preset.signalType === 'sine' || preset.signalType === 'sawtooth'
                    ? formatHz(preset.inputFreq, 0)
                    : 'Not used',
                ],
                ['Created', formatDateTime(preset.createdAt)],
                ['Updated', formatDateTime(preset.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-mist">{label}</dt>
                  <dd className="readout text-right text-sm text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-4">
          <section className="panel p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
              Audio snapshot
            </h2>

            {audioUrl ? (
              <div className="space-y-3">
                <audio controls src={audioUrl} className="w-full">
                  Your browser does not support the audio element.
                </audio>
                <p className="text-[11px] text-mist/80">
                  {render
                    ? `${render.durationSeconds.toFixed(1)} s · ${render.sampleRate} Hz · signed link expires in 1 hour`
                    : null}
                </p>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-mist">
                {render
                  ? 'The snapshot exists, but a playback link could not be created.'
                  : 'No rendered audio yet. Generate an 8-second offline snapshot of this preset and store it privately in Supabase Storage.'}
              </p>
            )}

            {audioError ? (
              <p className="mt-3 rounded-lg border border-amber-glow/30 bg-amber-glow/10 p-2.5 text-xs text-amber-100">
                {audioError}
              </p>
            ) : null}
            {snapshotError ? (
              <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                {snapshotError}
              </p>
            ) : null}

            {isOwner ? (
              <button
                type="button"
                className="btn btn-primary mt-3 w-full"
                onClick={() => void handleSnapshot()}
                disabled={snapshotBusy}
              >
                {snapshotBusy
                  ? 'Rendering audio…'
                  : render
                    ? 'Regenerate audio snapshot'
                    : 'Generate audio snapshot'}
              </button>
            ) : null}
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
              Note
            </h2>
            <p className="text-xs leading-relaxed text-mist">
              The graph is recalculated from the saved parameters. The snapshot is rendered offline
              with the same delay/feedback graph used by the live explorer, then uploaded as a WAV
              to the private <code className="readout text-mist">preset-audio</code> bucket.
            </p>
          </section>
        </div>
      </div>

      {editOpen ? (
        <EditPresetDialog
          open
          preset={preset}
          onClose={() => setEditOpen(false)}
          onSaved={setPreset}
        />
      ) : null}
    </div>
  )
}
