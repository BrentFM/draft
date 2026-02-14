import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { TitleBar } from '@renderer/components/TitleBar'
import { AppSidebar, type SidebarView } from '@renderer/components/AppSidebar'
import { TopBar } from '@renderer/components/TopBar'
import { PromptList } from '@renderer/components/PromptList'
import { PromptDetailSheet } from '@renderer/components/PromptDetailSheet'
import { SettingsSheet } from '@renderer/components/SettingsSheet'
import { usePrompts } from '@renderer/hooks/usePrompts'
import { api } from '@renderer/lib/api'

function inferTitleFromBody(body: string, maxLen = 60): string {
  const firstLine = body.split(/\r?\n/)[0]?.trim() ?? ''
  if (firstLine.length <= maxLen) return firstLine || 'Untitled'
  return firstLine.slice(0, maxLen - 3) + '...'
}

export default function App(): React.ReactElement {
  const [sidebarView, setSidebarView] = useState<SidebarView>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modelFilter, setModelFilter] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const copiedToastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof api.settings.get>> | null>(
    null
  )
  const [dataPath, setDataPath] = useState('')

  const { prompts, selected, error, selectId, refresh, create, update, remove, duplicate } =
    usePrompts()

  useEffect(() => {
    document.documentElement.dataset.platform = api.platform
  }, [])

  const loadSettings = useCallback(async () => {
    const s = await api.settings.get()
    const path = await api.store.getDataPath()
    return { settings: s, dataPath: path }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadSettings().then(({ settings, dataPath }) => {
      if (!cancelled) {
        setSettings(settings)
        setDataPath(dataPath)
      }
    })
    return () => {
      cancelled = true
    }
  }, [loadSettings])

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (settings.theme === 'light') root.classList.add('light')
    if (settings.theme === 'dark') root.classList.add('dark')
    if (settings.theme === 'system') {
      const q = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.add(q.matches ? 'dark' : 'light')
    }
  }, [settings])

  const filteredPrompts = useMemo(() => {
    let list = prompts
    if (sidebarView === 'favorites') list = list.filter((p) => p.isFavorite)
    if (sidebarView !== 'all' && sidebarView !== 'favorites') {
      list = list.filter((p) => p.collection === sidebarView)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (modelFilter) {
      list = list.filter((p) => (p.modelHint ?? '') === modelFilter)
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [prompts, sidebarView, searchQuery, modelFilter])

  const collections = useMemo(() => {
    const set = new Set<string>()
    prompts.forEach((p) => {
      if (p.collection) set.add(p.collection)
    })
    return Array.from(set).sort()
  }, [prompts])

  const modelHints = useMemo(() => {
    const set = new Set<string>()
    prompts.forEach((p) => {
      if (p.modelHint) set.add(p.modelHint)
    })
    return Array.from(set).sort()
  }, [prompts])

  const handleNewPrompt = useCallback(async () => {
    await create({
      title: 'Untitled',
      body: '',
      tags: [],
      isFavorite: false
    })
  }, [create])

  const handleNewFromClipboard = useCallback(async () => {
    const text = await api.clipboard.readText()
    const title = inferTitleFromBody(text)
    await create({
      title,
      body: text,
      tags: [],
      isFavorite: false
    })
  }, [create])

  const handleCopyBody = useCallback((text: string) => {
    api.clipboard.writeText(text)
    setShowCopiedToast(true)
    if (copiedToastTimeoutRef.current) clearTimeout(copiedToastTimeoutRef.current)
    copiedToastTimeoutRef.current = setTimeout(() => {
      setShowCopiedToast(false)
      copiedToastTimeoutRef.current = null
    }, 1500)
  }, [])

  const handleRenameCollection = useCallback(
    async (oldName: string, newName: string) => {
      const toUpdate = prompts.filter((p) => p.collection === oldName)
      for (const p of toUpdate) await update(p.id, { collection: newName })
      await refresh()
    },
    [prompts, update, refresh]
  )

  const handleRemoveCollection = useCallback(
    async (name: string) => {
      const toUpdate = prompts.filter((p) => p.collection === name)
      for (const p of toUpdate) await update(p.id, { collection: undefined })
      await refresh()
    },
    [prompts, update, refresh]
  )

  const handleCopyFromList = useCallback((prompt: { id: string; body: string }) => {
    api.clipboard.writeText(prompt.body)
    setShowCopiedToast(true)
    if (copiedToastTimeoutRef.current) clearTimeout(copiedToastTimeoutRef.current)
    copiedToastTimeoutRef.current = setTimeout(() => {
      setShowCopiedToast(false)
      copiedToastTimeoutRef.current = null
    }, 1500)
  }, [])

  const handleSettingsChange = useCallback(
    async (partial: Parameters<typeof api.settings.update>[0]) => {
      const next = await api.settings.update(partial)
      setSettings(next)
    },
    []
  )

  const handleImport = useCallback(async () => {
    const result = await api.dialog.showOpenDialog({
      title: 'Import prompts',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return
    await api.prompts.import(result.filePaths[0])
    await refresh()
  }, [refresh])

  const handleExport = useCallback(async () => {
    const result = await api.dialog.showSaveDialog({
      title: 'Export prompts',
      defaultPath: 'prompts-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return
    await api.prompts.export(result.filePath)
  }, [])

  useEffect(() => {
    api.menu.on('new-prompt', handleNewPrompt)
    api.menu.on('import', handleImport)
    api.menu.on('export', handleExport)
    api.menu.on('copy', () => {
      if (selected?.body) handleCopyBody(selected.body)
    })
    api.menu.on('about', () => setSettingsOpen(true))
  }, [handleNewPrompt, handleImport, handleExport, handleCopyBody, selected?.body])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          document.querySelector<HTMLInputElement>('input[aria-label="Search prompts"]')?.focus()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selected?.body) handleCopyBody(selected.body)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected?.body, handleCopyBody])

  const emptyMessage =
    sidebarView === 'favorites'
      ? 'Star prompts to see them here.'
      : searchQuery.trim()
        ? 'No prompts match your search.'
        : 'Create your first prompt or paste from clipboard.'

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          view={sidebarView}
          onViewChange={setSidebarView}
          collections={collections}
          onOpenSettings={() => setSettingsOpen(true)}
          onRenameCollection={handleRenameCollection}
          onRemoveCollection={handleRemoveCollection}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            modelFilter={modelFilter}
            modelHints={modelHints}
            onModelFilterChange={setModelFilter}
            onNewPrompt={handleNewPrompt}
            onNewFromClipboard={handleNewFromClipboard}
          />
          <main className="flex-1 overflow-auto">
            {error ? (
              <div className="p-4 text-destructive">{error}</div>
            ) : (
              <PromptList
                prompts={filteredPrompts}
                selectedId={selected?.id ?? null}
                onCopy={handleCopyFromList}
                onSelect={selectId}
                onDelete={remove}
                confirmBeforeDelete={settings?.confirmBeforeDelete ?? true}
                emptyMessage={emptyMessage}
                onNewPrompt={handleNewPrompt}
                onNewFromClipboard={handleNewFromClipboard}
              />
            )}
          </main>
        </div>
      </div>

      <PromptDetailSheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) selectId(null)
        }}
        prompt={selected}
        onUpdate={update}
        onDelete={remove}
        onDuplicate={duplicate}
        onCopyBody={handleCopyBody}
        confirmBeforeDelete={settings?.confirmBeforeDelete ?? true}
      />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings ?? { theme: 'system', globalHotkey: '', compactMode: false }}
        onSettingsChange={handleSettingsChange}
        dataPath={dataPath}
        onImport={handleImport}
        onExport={handleExport}
        onOpenDataFolder={() => api.store.openDataFolder()}
      />

      {showCopiedToast && (
        <div
          className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-lg"
          role="status"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied</span>
        </div>
      )}
    </div>
  )
}
