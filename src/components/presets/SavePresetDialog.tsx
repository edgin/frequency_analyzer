import { type FormEvent, useEffect, useId, useState } from 'react'
import { useAuth } from '../../lib/auth/useAuth'
import { formatMs, formatPercent } from '../../lib/format'
import { createPreset, saveAudioSnapshot } from '../../lib/presetsApi'
import { FILTER_LABELS, MODE_LABELS } from '../../lib/presets'
import type { ExplorerParams, Preset } from '../../types'

interface SavePresetDialogProps {
  open: boolean
  params: ExplorerParams
  onClose: () => void
  onSaved?: (preset: Preset) => void
}

type SnapshotState = 'idle' | 'working' | 'done' | 'error'

export function SavePresetDialog({ open, params, onClose, onSaved }: SavePresetDialogProps) {
  const { user } = useAuth()
  const nameId = useId()
  const descriptionId = useId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<Preset | null>(null)
  const [snapshotState, setSnapshotState] = useState<SnapshotState>('idle')
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, busy, onClose])

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      setError('Please log in before saving a preset.')
      return
    }
    if (!name.trim()) {
      setError('Give the preset a name.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const preset = await createPreset(
        user.id,
        name.trim(),
        description.trim() || null,
        params,
      )
      setSaved(preset)
      onSaved?.(preset)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the preset.')
    } finally {
      setBusy(false)
    }
  }

  const handleSnapshot = async () => {
    if (!saved) return
    setSnapshotState('working')
    setSnapshotError(null)
    try {
      await saveAudioSnapshot(saved)
      setSnapshotState('done')
    } catch (caught) {
      setSnapshotState('error')
      setSnapshotError(caught instanceof Error ? caught.message : 'Could not render audio.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${nameId}-title`}
        className="panel w-full max-w-lg p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={`${nameId}-title`} className="text-lg font-semibold text-white">
              {saved ? 'Preset saved' : 'Save preset'}
            </h2>
            <p className="mt-1 text-xs text-mist">
              Captures the current explorer settings so you can come back to them later.
            </p>
          </div>
          <button
            type="button"
            className="btn px-2.5 py-1 text-xs"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-line bg-charcoal-950/60 p-3 text-xs text-mist">
          <span>{MODE_LABELS[params.mode]}</span>
          <span>{FILTER_LABELS[params.filterType]}</span>
          <span>Delay L: {formatMs(params.delayLeftMs)}</span>
          <span>Delay R: {formatMs(params.delayRightMs)}</span>
          <span>Feedback: {formatPercent(params.feedback)}</span>
          <span>Dry/Wet: {formatPercent(params.dryWet)}</span>
        </div>

        {saved ? (
          <div className="space-y-3">
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
              “{saved.name}” is now in your preset library.
            </p>
            <div className="rounded-lg border border-line bg-charcoal-950/60 p-3">
              <p className="text-sm font-medium text-white">Audio snapshot (optional)</p>
              <p className="mt-1 text-xs text-mist">
                Renders 8 seconds of this preset offline and uploads a WAV to your private storage.
              </p>
              {snapshotState === 'done' ? (
                <p className="mt-2 text-xs text-emerald-300">Snapshot uploaded.</p>
              ) : null}
              {snapshotError ? (
                <p className="mt-2 text-xs text-red-300">{snapshotError}</p>
              ) : null}
              <button
                type="button"
                className="btn btn-primary mt-3 w-full"
                onClick={handleSnapshot}
                disabled={snapshotState === 'working' || snapshotState === 'done'}
              >
                {snapshotState === 'working'
                  ? 'Rendering audio…'
                  : snapshotState === 'done'
                    ? 'Snapshot saved'
                    : 'Generate audio snapshot'}
              </button>
            </div>
            <button type="button" className="btn w-full" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor={nameId}
                className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
              >
                Name
              </label>
              <input
                id={nameId}
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="e.g. Glass bell"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor={descriptionId}
                className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
              >
                Description <span className="normal-case tracking-normal text-mist/60">(optional)</span>
              </label>
              <textarea
                id={descriptionId}
                className="field min-h-20 resize-y"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={400}
                placeholder="What does this setting sound like?"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-1">
              <button type="button" className="btn flex-1" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1" disabled={busy}>
                {busy ? 'Saving…' : 'Save preset'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
