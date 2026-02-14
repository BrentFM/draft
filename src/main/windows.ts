import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null
let paletteWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function setMainWindow(win: BrowserWindow | null): void {
  mainWindow = win
}

export function getPaletteWindow(): BrowserWindow | null {
  return paletteWindow
}

export function createPaletteWindow(): BrowserWindow {
  if (paletteWindow && !paletteWindow.isDestroyed()) {
    paletteWindow.focus()
    paletteWindow.show()
    paletteWindow.webContents.send('palette:focus')
    return paletteWindow
  }

  const win = new BrowserWindow({
    width: 560,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  paletteWindow = win

  const baseUrl =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? process.env['ELECTRON_RENDERER_URL']
      : `file://${join(__dirname, '../renderer/index.html')}`
  const url = baseUrl.includes('?') ? `${baseUrl}&palette=1` : `${baseUrl}#palette`
  win.loadURL(url)

  win.on('closed', () => {
    paletteWindow = null
  })

  win.center()
  win.show()
  return win
}

export function showPaletteWindow(): void {
  createPaletteWindow()
}

export function closePaletteWindow(): void {
  if (paletteWindow && !paletteWindow.isDestroyed()) {
    paletteWindow.close()
    paletteWindow = null
  }
}
