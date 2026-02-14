import React, { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { SheetHeader } from '@renderer/components/SheetHeader'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { api } from '@renderer/lib/api'
import { cn } from '@renderer/lib/utils'
import type { AppSettings } from '@renderer/lib/api'

function keyEventToAccelerator(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key
  parts.push(key)
  return parts.join('+')
}

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSettingsChange: (partial: Partial<AppSettings>) => void
  dataPath: string
  onImport: () => void
  onExport: () => void
  onOpenDataFolder: () => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  dataPath,
  onImport,
  onExport,
  onOpenDataFolder
}: SettingsSheetProps): React.ReactElement {
  const [recordingHotkey, setRecordingHotkey] = useState(false)
  const [hotkeyError, setHotkeyError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!recordingHotkey) return
      e.preventDefault()
      e.stopPropagation()
      const acc = keyEventToAccelerator(e)
      setRecordingHotkey(false)
      api.hotkey
        .register(acc)
        .then((ok) => {
          if (ok) {
            onSettingsChange({ globalHotkey: acc })
            setHotkeyError(null)
          } else {
            setHotkeyError('Shortcut already in use or invalid.')
          }
        })
        .catch(() => setHotkeyError('Failed to register shortcut.'))
    },
    [recordingHotkey, onSettingsChange]
  )

  useEffect(() => {
    if (!recordingHotkey) return
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [recordingHotkey, handleKeyDown])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        belowTitleBar
        className="fixed top-10 left-0 right-0 bottom-0 z-50 flex h-[calc(100vh-2.5rem)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 border-0 p-0 [data-state=open]:animate-none [data-state=closed]:animate-none sm:rounded-none [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader
          title="Settings"
          subtitle="App preferences and data"
          onClose={() => onOpenChange(false)}
        />

        <div className="sheet-scroll min-h-0 flex-1 overflow-y-auto bg-[var(--muted)]/40">
          <div className="mx-auto max-w-[520px] px-6 py-6">
            {/* General */}
            <p className="sheet-section-title">General</p>
            <div className="sheet-group">
              <div className="sheet-row">
                <span className="sheet-row-label">Global hotkey</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-[13px] text-muted-foreground">
                    {settings.globalHotkey || 'None'}
                  </span>
                  <Button
                    size="sm"
                    variant={recordingHotkey ? 'default' : 'outline'}
                    className="h-8"
                    onClick={() => {
                      setRecordingHotkey(true)
                      setHotkeyError(null)
                    }}
                  >
                    {recordingHotkey ? 'Press keys…' : 'Record'}
                  </Button>
                </div>
              </div>
              {hotkeyError && (
                <p className="px-4 pb-2 text-[13px] text-destructive">{hotkeyError}</p>
              )}
              <div className="sheet-row">
                <span className="sheet-row-label">Appearance</span>
                <div className="flex gap-1 rounded-lg bg-muted/80 p-0.5">
                  {(['system', 'light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSettingsChange({ theme: t })}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                        settings.theme === t
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Palette */}
            <p className="sheet-section-title">Palette</p>
            <div className="sheet-group">
              <label className="sheet-row cursor-pointer">
                <span className="sheet-row-label">Close after copy</span>
                <Checkbox
                  checked={settings.closePaletteOnCopy ?? true}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ closePaletteOnCopy: !!checked })
                  }
                  className="pointer-events-none"
                />
              </label>
            </div>

            {/* Prompts */}
            <p className="sheet-section-title">Prompts</p>
            <div className="sheet-group">
              <label className="sheet-row cursor-pointer">
                <span className="sheet-row-label">Compact mode</span>
                <Checkbox
                  checked={settings.compactMode ?? false}
                  onCheckedChange={(checked) => onSettingsChange({ compactMode: !!checked })}
                  className="pointer-events-none"
                />
              </label>
              <label className="sheet-row cursor-pointer">
                <span className="sheet-row-label">Confirm before delete</span>
                <Checkbox
                  checked={settings.confirmBeforeDelete ?? true}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ confirmBeforeDelete: !!checked })
                  }
                  className="pointer-events-none"
                />
              </label>
            </div>

            {/* Data */}
            <p className="sheet-section-title">Data</p>
            <div className="sheet-group">
              <div className="sheet-row flex-col items-stretch gap-1 py-3">
                <span className="sheet-row-label">Storage location</span>
                <p
                  className="truncate text-[13px] text-muted-foreground"
                  title={dataPath}
                >
                  {dataPath}
                </p>
              </div>
              <div className="sheet-row justify-end gap-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={onOpenDataFolder}>
                  Open folder
                </Button>
                <Button size="sm" variant="outline" onClick={onImport}>
                  Import…
                </Button>
                <Button size="sm" variant="outline" onClick={onExport}>
                  Export…
                </Button>
              </div>
            </div>

            <p className="mt-6 text-[12px] text-muted-foreground">
              A small indie tool. If you find it useful, consider supporting development.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
