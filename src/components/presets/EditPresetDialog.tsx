import { type FormEvent, useEffect, useId, useState } from 'react'
import { updatePresetDetails } from '../../lib/presetsApi'
import type { Preset } from '../../types'

interface EditPresetDialogProps {
  open: boolean
  preset: Preset
  onClose: () => void
  onSaved: (preset: Preset) => void
}

export function EditPresetDialog({ open, preset, onClose, onSaved }: EditPresetDialogProps) {
  const nameId = useId()
  const descriptionId = useId()
  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!name.trim()) {
      setError('Give the preset a name.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const updated = await updatePresetDetails(
        preset.id,
        name.trim(),
        description.trim() || null,
      )
      onSaved(updated)
      onClose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the preset.')
    } finally {
      setBusy(false)
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
        <h2 id={`${nameId}-title`} className="text-lg font-semibold text-white">
          Edit preset details
        </h2>
        <p className="mt-1 text-xs text-mist">
          Rename the preset or update its description. Audio and parameters stay unchanged.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor={descriptionId}
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
            >
              Description
            </label>
            <textarea
              id={descriptionId}
              className="field min-h-20 resize-y"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={400}
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
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
