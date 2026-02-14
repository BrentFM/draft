import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initStore, getSettings } from './store'
import { registerIpcHandlers } from './ipc'
import { registerHotkey } from './hotkey'
import { setMainWindow, showPaletteWindow } from './windows'
import { createAppMenu } from './menu'
import { createTray } from './tray'

function getIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'draft-logo.png')
  }
  return join(__dirname, '../../resources/draft-logo.png')
}

function createWindow(): BrowserWindow {
  const iconPath = getIconPath()
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 700,
    height: 520,
    minWidth: 560,
    minHeight: 360,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset',
          // Applied at window creation only — quit app (Cmd+Q) and restart to see changes
          trafficLightPosition: { x: 12, y: 12 }
        }
      : {
          frame: false
        }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.on('ready-to-show', () => {
    win.center()
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.setTitle('Draft')
  setMainWindow(win)
  return win
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.promptlibrary.app')
  initStore()
  registerIpcHandlers(showPaletteWindow)

  const settings = getSettings()
  registerHotkey(settings.globalHotkey, showPaletteWindow)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createAppMenu()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
