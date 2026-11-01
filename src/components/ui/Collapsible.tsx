import type { ReactNode } from 'react'

interface CollapsibleProps {
  title: string
  subtitle?: string
  children: ReactNode
  defaultOpen?: boolean
}

export function Collapsible({ title, subtitle, children, defaultOpen = false }: CollapsibleProps) {
  return (
    <details className="panel group p-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-semibold text-white">{title}</span>
          {subtitle ? <span className="mt-0.5 block text-xs text-mist">{subtitle}</span> : null}
        </span>
        <span
          aria-hidden="true"
          className="text-mist transition-transform duration-200 group-open:rotate-180"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-mist">
        {children}
      </div>
    </details>
  )
}
