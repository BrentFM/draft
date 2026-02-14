import { app, Menu } from 'electron'
import { getMainWindow, showPaletteWindow } from './windows'
import { getSettings } from './store'

function getHotkeyLabel(): string {
  const s = getSettings().globalHotkey
  if (!s) return ''
  return s.replace('CommandOrControl', process.platform === 'darwin' ? 'Cmd' : 'Ctrl')
}

export function createAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Prompt',
          accelerator: 'CommandOrControl+N',
          click: () => sendToMain('new-prompt')
        },
        { type: 'separator' },
        { label: 'Import...', click: () => sendToMain('import') },
        { label: 'Export...', click: () => sendToMain('export') },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Copy', accelerator: 'CommandOrControl+C', click: () => sendToMain('copy') }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Open Global Palette',
          accelerator: getHotkeyLabel(),
          click: () => showPaletteWindow()
        }
      ]
    },
    {
      label: 'Help',
      submenu: [{ label: 'About Prompt Library', click: () => sendToMain('about') }]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function sendToMain(channel: string): void {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) win.webContents.send(channel)
}
