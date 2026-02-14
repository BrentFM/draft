import { globalShortcut } from 'electron'

let currentAccelerator: string | null = null

export function registerHotkey(accelerator: string, callback: () => void): boolean {
  unregisterHotkey()
  try {
    const ok = globalShortcut.register(accelerator, callback)
    if (ok) currentAccelerator = accelerator
    return ok
  } catch {
    return false
  }
}

export function unregisterHotkey(): void {
  if (currentAccelerator) {
    try {
      globalShortcut.unregister(currentAccelerator)
    } catch {
      // ignore
    }
    currentAccelerator = null
  }
}
