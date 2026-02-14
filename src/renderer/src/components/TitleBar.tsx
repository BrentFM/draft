import React, { useState, useEffect } from 'react'
import { api } from '@renderer/lib/api'
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

const isMac = api.platform === 'darwin'

export function TitleBar(): React.ReactElement {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (isMac) return
    api.window.isMaximized().then(setIsMaximized)
  }, [])

  const handleMaximize = (): void => {
    if (isMac) return
    api.window.maximize().then(() => {
      setIsMaximized((v) => !v)
    })
  }

  return (
    <header
      className={cn(
        'flex h-10 shrink-0 items-center border-b border-sidebar-border bg-sidebar text-sidebar-foreground',
        'select-none'
      )}
      style={
        {
          paddingLeft: isMac ? 85 : 12,
          paddingRight: isMac ? 12 : 0,
          WebkitAppRegion: 'drag'
        } as React.CSSProperties
      }
    >
      <div className="flex items-center gap-2">
        {/* <img
          src="./draft-logo.png"
          alt=""
          className="h-5 w-5 shrink-0 rounded object-contain"
          draggable={false}
        /> */}
        <span className="text-[13px] font-semibold tracking-tight">Draft</span>
      </div>

      {!isMac && (
        <div
          className="ml-auto flex h-full items-stretch"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={() => api.window.minimize()}
            className="flex w-11 items-center justify-center text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            className="flex w-11 items-center justify-center text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => api.window.close()}
            className="flex w-11 items-center justify-center text-sidebar-foreground/80 transition-colors hover:bg-red-500 hover:text-white"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </header>
  )
}
