import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@renderer/lib/utils'
import type { Prompt } from '@renderer/lib/api'
import { Star, Pencil, Copy, Trash2 } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'

interface PromptListProps {
  prompts: Prompt[]
  selectedId: string | null
  onCopy: (prompt: Prompt) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<boolean>
  confirmBeforeDelete: boolean
  emptyMessage?: string
  onNewPrompt?: () => void
  onNewFromClipboard?: () => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  } catch {
    return ''
  }
}

function snippet(body: string, maxLen = 72): string {
  const line = body.split(/\r?\n/)[0]?.trim() ?? ''
  if (line.length <= maxLen) return line
  return line.slice(0, maxLen) + '…'
}

export function PromptList({
  prompts,
  selectedId,
  onCopy,
  onSelect,
  onDelete,
  confirmBeforeDelete,
  emptyMessage = 'No prompts yet.',
  onNewPrompt,
  onNewFromClipboard
}: PromptListProps): React.ReactElement {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; prompt: Prompt } | null>(
    null
  )
  const menuRef = useRef<HTMLDivElement>(null)

  const contextMenuPosition = contextMenu
    ? (() => {
        const padding = 8
        const estWidth = 140
        const estHeight = 150
        let left = contextMenu.x
        let top = contextMenu.y
        if (left + estWidth > window.innerWidth - padding) left = window.innerWidth - estWidth - padding
        if (left < padding) left = padding
        if (top + estHeight > window.innerHeight - padding) top = window.innerHeight - estHeight - padding
        if (top < padding) top = padding
        return { left, top }
      })()
    : null

  useEffect(() => {
    if (!contextMenu) return
    const close = (): void => setContextMenu(null)
    const onMouseDown = (e: MouseEvent): void => {
      if (menuRef.current?.contains(e.target as Node)) return
      close()
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [contextMenu])

  if (prompts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <p className="text-[15px] text-muted-foreground">{emptyMessage}</p>
        {(onNewPrompt ?? onNewFromClipboard) && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {onNewPrompt && (
              <Button type="button" onClick={onNewPrompt} size="sm">
                New prompt
              </Button>
            )}
            {onNewFromClipboard && (
              <Button type="button" variant="outline" onClick={onNewFromClipboard} size="sm">
                Paste from clipboard
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border" role="list">
      {prompts.map((p) => (
        <li key={p.id}>
          <div
            className={cn(
              'group flex min-h-[44px] w-full items-start gap-2 px-4 py-3 transition-colors',
              selectedId === p.id ? 'bg-accent/50' : 'hover:bg-muted/40'
            )}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu({ x: e.clientX, y: e.clientY, prompt: p })
            }}
          >
            <button
              type="button"
              onClick={() => onCopy(p)}
              className="relative flex min-w-0 flex-1 flex-col gap-1.5 text-left"
            >
              <div className="flex items-center gap-2">
                {p.isFavorite && (
                  <Star
                    className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-500"
                    aria-hidden
                  />
                )}
                <span className="truncate text-[15px] font-medium text-foreground">
                  {p.title || 'Untitled'}
                </span>
              </div>
              {p.body.trim() && (
                <p className="truncate text-[13px] text-muted-foreground">{snippet(p.body)}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {p.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
                {p.collection && (
                  <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200">
                    {p.collection}
                  </span>
                )}
                <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                  {formatDate(p.updatedAt)}
                </span>
              </div>
            </button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(p.id)
              }}
              aria-label="Edit prompt"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
      {contextMenu &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] min-w-[140px] overflow-hidden rounded-xl border border-border bg-popover px-1.5 py-1 text-popover-foreground shadow-lg"
            style={{
              left: contextMenuPosition?.left ?? contextMenu.x,
              top: contextMenuPosition?.top ?? contextMenu.y
            }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => {
                onCopy(contextMenu.prompt)
                setContextMenu(null)
              }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => {
                onSelect(contextMenu.prompt.id)
                setContextMenu(null)
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <div className="my-1 border-t border-border" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent"
              onClick={async () => {
                if (confirmBeforeDelete && !window.confirm('Delete this prompt?')) {
                  setContextMenu(null)
                  return
                }
                await onDelete(contextMenu.prompt.id)
                setContextMenu(null)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>,
          document.body
        )}
    </ul>
  )
}
