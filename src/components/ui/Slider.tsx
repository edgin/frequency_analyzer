import { type CSSProperties, useId } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  accent?: string
  hint?: string
  disabled?: boolean
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  accent = '#22d3ee',
  hint,
  disabled = false,
}: SliderProps) {
  const id = useId()
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100
  const style = {
    '--fill': `${Math.max(0, Math.min(100, percentage))}%`,
    '--slider-accent': accent,
  } as CSSProperties

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
        >
          {label}
        </label>
        <span className="readout text-lg text-white">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="dre-slider mt-1.5"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={style}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <p className="mt-1 text-xs leading-snug text-mist/80">{hint}</p> : null}
    </div>
  )
}
