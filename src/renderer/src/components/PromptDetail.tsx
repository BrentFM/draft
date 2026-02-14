import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'
import type { Prompt } from '@renderer/lib/api'
import { Star, Copy, Trash2, CopyPlus, Loader2, Check } from 'lucide-react'

const SAVE_DEBOUNCE_MS = 400
const SAVED_SHOW_MS = 1800

interface PromptDetailProps {
  prompt: Prompt | null
  onUpdate: (id: string, data: Partial<Prompt>) => Promise<unknown>
  onDelete: (id: string) => Promise<boolean>
  onDuplicate: (id: string) => Promise<Prompt | null>
  onCopyBody: (text: string) => void
  confirmBeforeDelete: boolean
}

export function PromptDetail({
  prompt,
  onUpdate,
  onDelete,
  onDuplicate,
  onCopyBody,
  confirmBeforeDelete
}: PromptDetailProps): React.ReactElement {
  const [title, setTitle] = useState(() => prompt?.title ?? '')
  const [body, setBody] = useState(() => prompt?.body ?? '')
  const [tagsStr, setTagsStr] = useState(() => prompt?.tags.join(', ') ?? '')
  const [collection, setCollection] = useState(() => prompt?.collection ?? '')
  const [modelHint, setModelHint] = useState(() => prompt?.modelHint ?? '')
  const [isFavorite, setIsFavorite] = useState(() => prompt?.isFavorite ?? false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const dirtyRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSave = useCallback(async (): Promise<void> => {
    if (!prompt || !dirtyRef.current) return
    dirtyRef.current = false
    setSaveStatus('saving')
    try {
      await onUpdate(prompt.id, {
        title,
        body,
        tags: tagsStr
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        collection: collection || undefined,
        modelHint: modelHint || undefined,
        isFavorite
      })
      setSaveStatus('saved')
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), SAVED_SHOW_MS)
    } catch {
      setSaveStatus('idle')
    }
  }, [prompt, title, body, tagsStr, collection, modelHint, isFavorite, onUpdate])

  useEffect(() => {
    if (!prompt || !dirtyRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(performSave, SAVE_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [prompt, title, body, tagsStr, collection, modelHint, isFavorite, performSave])

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const markDirty = useCallback((): void => {
    dirtyRef.current = true
  }, [])

  const handleDelete = async (): Promise<void> => {
    if (!prompt) return
    if (confirmBeforeDelete && !window.confirm('Delete this prompt?')) return
    await onDelete(prompt.id)
  }

  const handleDuplicate = async (): Promise<void> => {
    if (!prompt) return
    await onDuplicate(prompt.id)
  }

  if (!prompt) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[15px] text-muted-foreground">
        Select a prompt or create a new one.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="sheet-scroll min-h-0 flex-1 overflow-y-auto bg-[var(--muted)]/40">
        <div className="mx-auto max-w-[520px] px-6 py-6">
          {/* Title + Favorite */}
          <div className="sheet-group">
            <div className="sheet-row gap-3">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  markDirty()
                }}
                placeholder="Title"
                className="min-h-0 flex-1 border-0 bg-transparent px-0 text-[15px] font-medium shadow-none focus-visible:ring-0"
                aria-label="Prompt title"
              />
              <Button
                size="icon"
                variant={isFavorite ? 'default' : 'outline'}
                className="h-8 w-8 shrink-0"
                onClick={() => {
                  setIsFavorite(!isFavorite)
                  markDirty()
                }}
                aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              </Button>
            </div>
          </div>

          {/* Details */}
          <p className="sheet-section-title">Details</p>
          <div className="sheet-group">
            <div className="sheet-row flex-col items-stretch gap-1 py-2">
              <span className="sheet-row-label text-[13px]">Tags</span>
              <Input
                value={tagsStr}
                onChange={(e) => {
                  setTagsStr(e.target.value)
                  markDirty()
                }}
                placeholder="tag1, tag2"
                className="h-9 border-border text-[15px]"
                aria-label="Tags"
              />
            </div>
            <div className="sheet-row flex-col items-stretch gap-1 py-2">
              <span className="sheet-row-label text-[13px]">Collection</span>
              <Input
                value={collection}
                onChange={(e) => {
                  setCollection(e.target.value)
                  markDirty()
                }}
                placeholder="Optional"
                className="h-9 border-border text-[15px]"
                aria-label="Collection"
              />
            </div>
            <div className="sheet-row flex-col items-stretch gap-1 py-2">
              <span className="sheet-row-label text-[13px]">Model hint</span>
              <Input
                value={modelHint}
                onChange={(e) => {
                  setModelHint(e.target.value)
                  markDirty()
                }}
                placeholder="e.g. gpt-4, claude"
                className="h-9 border-border text-[15px]"
                aria-label="Model hint"
              />
            </div>
          </div>

          {/* Content */}
          <p className="sheet-section-title">Content</p>
          <div className="sheet-group">
            <div className="p-4">
              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value)
                  markDirty()
                }}
                placeholder="Prompt content…"
                className={cn(
                  'min-h-[220px] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-[15px] leading-relaxed',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
                aria-label="Prompt body"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: same treatment as sheet header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border bg-background px-6 py-3">
        <div className="flex min-h-[36px] items-center gap-2 text-[13px] text-muted-foreground">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>Saving…</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
              <span className="text-green-600 dark:text-green-400">Saved</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyBody(prompt.body)}
            className="h-8"
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={handleDuplicate} className="h-8">
            <CopyPlus className="mr-1.5 h-4 w-4" />
            Duplicate
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} className="h-8">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
