import { app, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { getMainWindow, showPaletteWindow } from './windows'

function getTrayIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'draft-logo.png')
  }
  return join(__dirname, '../../resources/draft-logo.png')
}

let tray: Tray | null = null

export function createTray(): void {
  const iconPath = getTrayIconPath()
  const icon = nativeImage.createFromPath(iconPath)
  if (icon.isEmpty()) return

  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Palette', click: () => showPaletteWindow() },
    { label: 'Open App', click: () => focusMain() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setToolTip('Draft')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => focusMain())
}

function focusMain(): void {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.show()
    win.focus()
  }
}
