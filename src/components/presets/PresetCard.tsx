import { Link } from 'react-router-dom'
import { formatDate, formatMs, formatPercent } from '../../lib/format'
import { FILTER_LABELS, MODE_LABELS } from '../../lib/presets'
import type { Preset } from '../../types'

export function PresetCard({ preset }: { preset: Preset }) {
  const delayText =
    preset.mode === 'stereo'
      ? `L ${formatMs(preset.delayLeftMs)} · R ${formatMs(preset.delayRightMs)}`
      : formatMs(preset.delayLeftMs)

  return (
    <Link
      to={`/presets/${preset.id}`}
      className="panel block p-4 transition-colors hover:border-cyan-glow/40 focus-visible:border-cyan-glow/60"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{preset.name}</h3>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
          {MODE_LABELS[preset.mode]}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-relaxed text-mist">
        {preset.description || 'No description.'}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs">
        <div>
          <dt className="text-mist/70">Delay</dt>
          <dd className="readout mt-0.5 text-white">{delayText}</dd>
        </div>
        <div>
          <dt className="text-mist/70">Feedback</dt>
          <dd className="readout mt-0.5 text-white">{formatPercent(preset.feedback)}</dd>
        </div>
        <div>
          <dt className="text-mist/70">Filter</dt>
          <dd className="mt-0.5 text-white">{FILTER_LABELS[preset.filterType]}</dd>
        </div>
        <div>
          <dt className="text-mist/70">Saved</dt>
          <dd className="mt-0.5 text-white">{formatDate(preset.createdAt)}</dd>
        </div>
      </dl>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-glow/90">
        Open details
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}
