import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@renderer/components/ui/input'
import { api } from '@renderer/lib/api'
import type { Prompt } from '@renderer/lib/api'

const PALETTE_MAX_RESULTS = 50

export function PaletteView(): React.ReactElement {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [closeOnCopy, setCloseOnCopy] = useState(true)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return prompts.slice(0, PALETTE_MAX_RESULTS)
    return prompts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, PALETTE_MAX_RESULTS)
  }, [prompts, search])

  useEffect(() => {
    api.prompts.list().then(setPrompts)
  }, [])

  useEffect(() => {
    api.settings.get().then((s) => setCloseOnCopy(s.closePaletteOnCopy ?? true))
  }, [])

  const clampedIndex = filtered.length === 0 ? 0 : Math.min(selectedIndex, filtered.length - 1)

  const select = useCallback(
    (index: number) => {
      const p = filtered[index]
      if (!p) return
      api.clipboard.writeText(p.body)
      if (closeOnCopy) api.palette.close()
    },
    [filtered, closeOnCopy]
  )

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const child = el.children[clampedIndex] as HTMLElement | undefined
    child?.scrollIntoView({ block: 'nearest' })
  }, [clampedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        select(clampedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        api.palette.close()
      }
    },
    [filtered.length, clampedIndex, select]
  )

  return (
    <div className="flex h-full flex-col bg-background p-3" onKeyDown={handleKeyDown}>
      <Input
        placeholder="Search prompts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
        autoFocus
        aria-label="Search prompts"
      />
      <ul
        ref={listRef}
        className="flex flex-1 flex-col gap-0 overflow-auto rounded-md border border-border"
        role="listbox"
        aria-label="Prompt results"
      >
        {filtered.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">No prompts match.</li>
        ) : (
          filtered.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === clampedIndex}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  i === clampedIndex ? 'bg-accent' : 'hover:bg-muted/50'
                }`}
                onClick={() => select(i)}
              >
                <div className="font-medium truncate">{p.title || '(Untitled)'}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.body.split(/\r?\n/)[0]?.slice(0, 80) ?? ''}
                </div>
                {p.tags.length > 0 && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {p.tags.slice(0, 3).join(', ')}
                  </div>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">↑↓ navigate · Enter copy · Esc close</p>
    </div>
  )
}
