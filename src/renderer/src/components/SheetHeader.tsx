import React from 'react'
import { X } from 'lucide-react'

interface SheetHeaderProps {
  title: string
  subtitle?: string
  onClose: () => void
}

/**
 * In-page header for sheets: title and optional subtitle above the content,
 * with a Close button. Renders inside the sheet content area (not in the window bar).
 */
export function SheetHeader({
  title,
  subtitle,
  onClose
}: SheetHeaderProps): React.ReactElement {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background px-6 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[13px] leading-tight text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Close"
      >
        <X className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </div>
  )
}
