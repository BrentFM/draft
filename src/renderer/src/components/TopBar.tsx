import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Plus, ClipboardPaste, Search, X } from 'lucide-react'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  modelFilter: string
  modelHints: string[]
  onModelFilterChange: (value: string) => void
  onNewPrompt: () => void
  onNewFromClipboard: () => void
}

export function TopBar({
  searchQuery,
  onSearchChange,
  modelFilter,
  modelHints,
  onModelFilterChange,
  onNewPrompt,
  onNewFromClipboard
}: TopBarProps): React.ReactElement {
  const [searchExpanded, setSearchExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchExpanded) inputRef.current?.focus()
  }, [searchExpanded])

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className="relative flex items-center overflow-hidden rounded-full bg-zinc-200/80 transition-[width] duration-200 ease-out dark:bg-zinc-700/60"
        style={{ width: searchExpanded ? 220 : 32 }}
      >
        {!searchExpanded ? (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={() => setSearchExpanded(true)}
            aria-label="Search prompts"
          >
            <Search className="h-4 w-4 shrink-0" />
          </button>
        ) : (
          <>
            <Search
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-zinc-600 dark:text-zinc-400"
              aria-hidden
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim()) setSearchExpanded(false)
              }}
              className="h-8 w-full min-w-0 rounded-full border-0 bg-transparent pl-9 pr-9 text-sm placeholder:text-zinc-500 focus-visible:ring-0 dark:placeholder:text-zinc-400"
              aria-label="Search prompts"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-end gap-1">
        {modelHints.length > 0 && (
          <Select
            value={modelFilter || 'all'}
            onValueChange={(v) => onModelFilterChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger
              className="h-8 w-[132px] rounded-full border-0 bg-zinc-200/80 text-sm dark:bg-zinc-700/60 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              aria-label="Filter by model"
            >
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {modelHints.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-zinc-200/80 hover:text-foreground dark:hover:bg-zinc-700/60"
          onClick={onNewFromClipboard}
          aria-label="New from clipboard"
        >
          <ClipboardPaste className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-zinc-200/80 hover:text-foreground dark:hover:bg-zinc-700/60"
          onClick={onNewPrompt}
          aria-label="New prompt"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
