import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from 'react'
import { DB_CEILING, DB_FLOOR, nearestPeak, responseDb, spacingHz } from '../../lib/audio/response'
import { formatDb, formatHz } from '../../lib/format'
import type { FilterType } from '../../types'

export interface GraphCurve {
  key: string
  label: string
  delayMs: number
  color: string
}

interface ResponseGraphProps {
  curves: GraphCurve[]
  filterType: FilterType
  feedback: number
  className?: string
}

interface Size {
  width: number
  height: number
  dpr: number
}

interface Pointer {
  x: number
  y: number
  active: boolean
}

const MAX_FREQUENCY = 3000

export function ResponseGraph({
  curves,
  filterType,
  feedback,
  className = 'h-[340px] sm:h-[400px]',
}: ResponseGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sizeRef = useRef<Size>({ width: 0, height: 0, dpr: 1 })
  const pointerRef = useRef<Pointer>({ x: 0, y: 0, active: false })
  const latestRef = useRef({ curves, filterType, feedback })
  const rafRef = useRef<number | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const { width, height, dpr } = sizeRef.current
    if (width <= 0 || height <= 0) return

    const { curves: currentCurves, filterType: currentFilter, feedback: currentFeedback } =
      latestRef.current

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, width, height)

    const padding = { top: 26, right: 18, bottom: 34, left: 52 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom
    if (plotWidth <= 0 || plotHeight <= 0) return

    const frequencyToX = (frequency: number) =>
      padding.left + (frequency / MAX_FREQUENCY) * plotWidth
    const dbToY = (db: number) =>
      padding.top + ((DB_CEILING - db) / (DB_CEILING - DB_FLOOR)) * plotHeight

    const background = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight)
    background.addColorStop(0, '#0a1116')
    background.addColorStop(1, '#070c10')
    context.fillStyle = background
    context.fillRect(padding.left, padding.top, plotWidth, plotHeight)

    context.font = '10px "JetBrains Mono", ui-monospace, monospace'
    context.textBaseline = 'middle'

    for (let db = -36; db <= 36; db += 12) {
      const y = dbToY(db)
      context.strokeStyle = db === 0 ? '#22343f' : '#141f26'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(padding.left, y)
      context.lineTo(padding.left + plotWidth, y)
      context.stroke()

      context.fillStyle = db === 0 ? '#93aab7' : '#5f7480'
      context.textAlign = 'right'
      context.fillText(`${db > 0 ? '+' : ''}${db}`, padding.left - 10, y)
    }

    for (let frequency = 0; frequency <= MAX_FREQUENCY; frequency += 250) {
      const x = frequencyToX(frequency)
      context.strokeStyle = frequency % 500 === 0 ? '#18262f' : '#111b21'
      context.beginPath()
      context.moveTo(x, padding.top)
      context.lineTo(x, padding.top + plotHeight)
      context.stroke()

      if (frequency % 500 === 0) {
        context.fillStyle = '#5f7480'
        context.textAlign =
          frequency === 0 ? 'left' : frequency === MAX_FREQUENCY ? 'right' : 'center'
        context.fillText(
          `${frequency}`,
          frequency === 0 ? padding.left : x,
          padding.top + plotHeight + 16,
        )
      }
    }

    context.strokeStyle = '#243440'
    context.lineWidth = 1
    context.strokeRect(padding.left, padding.top, plotWidth, plotHeight)

    context.fillStyle = '#5f7480'
    context.textAlign = 'left'
    context.fillText('GAIN (dB)', padding.left, padding.top - 11)
    context.textAlign = 'right'
    context.fillText('FREQUENCY (Hz)', padding.left + plotWidth, padding.top + plotHeight + 30)

    for (const curve of currentCurves) {
      const spacing = spacingHz(curve.delayMs)
      if (spacing >= 25) {
        context.fillStyle = `${curve.color}55`
        for (let harmonic = 1; harmonic * spacing <= MAX_FREQUENCY && harmonic <= 60; harmonic += 1) {
          const peakFrequency = harmonic * spacing
          const peakDb = responseDb(peakFrequency, currentFilter, currentFeedback, curve.delayMs)
          context.beginPath()
          context.arc(frequencyToX(peakFrequency), dbToY(peakDb), 1.7, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.beginPath()
      const step = plotWidth / 700
      for (let x = padding.left; x <= padding.left + plotWidth; x += step) {
        const frequency = ((x - padding.left) / plotWidth) * MAX_FREQUENCY
        const db = responseDb(frequency, currentFilter, currentFeedback, curve.delayMs)
        const y = dbToY(db)
        if (x === padding.left) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }
      context.strokeStyle = curve.color
      context.lineWidth = 2
      context.shadowColor = curve.color
      context.shadowBlur = 10
      context.stroke()
      context.shadowBlur = 0
    }

    const pointer = pointerRef.current
    if (pointer.active) {
      const clampedX = Math.min(padding.left + plotWidth, Math.max(padding.left, pointer.x))
      const frequency = ((clampedX - padding.left) / plotWidth) * MAX_FREQUENCY

      context.strokeStyle = '#4b6573'
      context.lineWidth = 1
      context.setLineDash([4, 4])
      context.beginPath()
      context.moveTo(clampedX, padding.top)
      context.lineTo(clampedX, padding.top + plotHeight)
      context.stroke()
      context.setLineDash([])

      const lines: string[] = [formatHz(frequency, 0)]
      for (const curve of currentCurves) {
        const db = responseDb(frequency, currentFilter, currentFeedback, curve.delayMs)
        const y = dbToY(db)
        context.fillStyle = curve.color
        context.beginPath()
        context.arc(clampedX, y, 3, 0, Math.PI * 2)
        context.fill()
        lines.push(`${curve.label}: ${formatDb(db)}`)
      }

      if (currentCurves.length > 0) {
        const peak = nearestPeak(frequency, currentCurves[0].delayMs)
        lines.push(`Nearest peak: ${formatHz(peak.frequency, 1)}`)
      }

      context.font = '11px "JetBrains Mono", ui-monospace, monospace'
      const lineHeight = 16
      const boxWidth = Math.max(...lines.map((line) => context.measureText(line).width)) + 20
      const boxHeight = lines.length * lineHeight + 14
      let boxX = pointer.x + 14
      let boxY = pointer.y - boxHeight - 12
      if (boxX + boxWidth > width - 6) boxX = pointer.x - boxWidth - 14
      if (boxY < 6) boxY = pointer.y + 16
      boxX = Math.max(6, boxX)
      boxY = Math.max(6, Math.min(height - boxHeight - 6, boxY))

      context.fillStyle = 'rgba(9, 16, 21, 0.95)'
      context.strokeStyle = '#2d4552'
      context.lineWidth = 1
      context.beginPath()
      context.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      context.fill()
      context.stroke()

      context.textAlign = 'left'
      context.textBaseline = 'top'
      lines.forEach((line, index) => {
        const isFirst = index === 0
        const isPeakLine = line.startsWith('Nearest peak')
        context.fillStyle = isFirst ? '#e6eef2' : isPeakLine ? '#8fa3b0' : '#b7c8d1'
        context.fillText(line, boxX + 10, boxY + 8 + index * lineHeight)
      })
    }
  }, [])

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      draw()
    })
  }, [draw])

  const measure = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const width = container.clientWidth
    const height = container.clientHeight
    const dpr = window.devicePixelRatio || 1
    sizeRef.current = { width, height, dpr }
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, [])

  useEffect(() => {
    latestRef.current = { curves, filterType, feedback }
    scheduleDraw()
  }, [curves, filterType, feedback, scheduleDraw])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    measure()
    scheduleDraw()

    const observer = new ResizeObserver(() => {
      measure()
      scheduleDraw()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [measure, scheduleDraw])

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      }
      scheduleDraw()
    },
    [scheduleDraw],
  )

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = { ...pointerRef.current, active: false }
    scheduleDraw()
  }, [scheduleDraw])

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4">
          {curves.map((curve) => (
            <span key={curve.key} className="flex items-center gap-1.5 text-xs text-mist">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: curve.color, boxShadow: `0 0 8px ${curve.color}` }}
              />
              {curve.label}
            </span>
          ))}
        </div>
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist/70">
          Theoretical response · 0–3000 Hz
        </span>
      </div>
      <div ref={containerRef} className={`relative w-full ${className}`}>
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none rounded-xl"
          role="img"
          aria-label="Frequency response graph. Move the pointer over the graph to inspect frequencies and gain."
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
      </div>
    </div>
  )
}
