import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@renderer/components/ui/collapsible'
import {
  ChevronRight,
  Coffee,
  FileText,
  Folder,
  Settings,
  Star,
  Pencil,
  Trash2
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'

export type SidebarView = 'all' | 'favorites' | string

interface AppSidebarProps {
  view: SidebarView
  onViewChange: (view: SidebarView) => void
  collections: string[]
  onOpenSettings: () => void
  onRenameCollection: (oldName: string, newName: string) => Promise<void>
  onRemoveCollection: (name: string) => Promise<void>
}

export function AppSidebar({
  view,
  onViewChange,
  collections,
  onOpenSettings,
  onRenameCollection,
  onRemoveCollection
}: AppSidebarProps): React.ReactElement {
  const [collectionsOpen, setCollectionsOpen] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; name: string } | null>(
    null
  )
  const menuRef = useRef<HTMLDivElement>(null)

  const contextMenuPosition = contextMenu
    ? (() => {
        const padding = 8
        const estWidth = 160
        const estHeight = 100
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

  return (
    <aside
      className="flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground"
      style={{ ['--sidebar-width' as string]: '220px' }}
    >
      <div className="flex flex-col gap-1 p-2">
        <nav className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onViewChange('all')}
            className={cn(
              'flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
              view === 'all'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'hover:bg-sidebar-accent/60'
            )}
          >
            <FileText className="h-4 w-4 shrink-0 opacity-80" />
            <span>All</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange('favorites')}
            className={cn(
              'flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
              view === 'favorites'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'hover:bg-sidebar-accent/60'
            )}
          >
            <Star className="h-4 w-4 shrink-0 opacity-80" />
            <span>Favorites</span>
          </button>

          {collections.length > 0 && (
            <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                >
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      collectionsOpen && 'rotate-90'
                    )}
                  />
                  <span>Collections</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-1 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
                  {collections.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onViewChange(c)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setContextMenu({ x: e.clientX, y: e.clientY, name: c })
                      }}
                      className={cn(
                        'flex min-h-[36px] w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                        view === c
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/60'
                      )}
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{c}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-2">
        <a
          href="https://buymeacoffee.com/55fsgd75gwx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          aria-label="Buy me a coffee"
        >
          <Coffee className="h-4 w-4 shrink-0" />
          <span>Buy me a coffee</span>
        </a>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>

      {contextMenu &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover px-1.5 py-1 text-popover-foreground shadow-lg"
            style={{
              left: contextMenuPosition?.left ?? contextMenu.x,
              top: contextMenuPosition?.top ?? contextMenu.y
            }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => {
                const newName = window.prompt('Rename collection', contextMenu.name)
                if (newName != null && newName.trim()) {
                  onRenameCollection(contextMenu.name, newName.trim())
                }
                setContextMenu(null)
              }}
            >
              <Pencil className="h-4 w-4" />
              Rename
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent"
              onClick={async () => {
                if (
                  window.confirm(
                    `Remove collection "${contextMenu.name}"? Prompts will be uncategorized.`
                  )
                ) {
                  await onRemoveCollection(contextMenu.name)
                }
                setContextMenu(null)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Remove collection
            </button>
          </div>,
          document.body
        )}
    </aside>
  )
}
