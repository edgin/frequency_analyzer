interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  hint?: string
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: SegmentedControlProps<T>) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist">
        {label}
      </span>
      <div
        className="mt-1.5 grid gap-1 rounded-lg border border-line bg-charcoal-950/70 p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={[
                'rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
                selected
                  ? 'bg-cyan-glow/10 text-cyan-200 ring-1 ring-cyan-glow/40'
                  : 'text-mist hover:bg-charcoal-800 hover:text-white',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {hint ? <p className="mt-1 text-xs leading-snug text-mist/80">{hint}</p> : null}
    </div>
  )
}
