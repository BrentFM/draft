import { ipcMain, clipboard, dialog, shell, BrowserWindow } from 'electron'
import path from 'path'
import { closePaletteWindow, getMainWindow } from './windows'
import type { Prompt, PromptCreateInput, PromptUpdateInput } from '../shared/types/Prompt'
import type { AppSettings } from '../shared/types/Settings'
import {
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  getSettings,
  updateSettings,
  importFromFile,
  exportToFile,
  initStore
} from './store'
import * as hotkey from './hotkey'

export function registerIpcHandlers(onPaletteHotkey?: () => void): void {
  ipcMain.handle('prompts:list', (): Prompt[] => listPrompts())
  ipcMain.handle('prompts:get', (_, id: string): Prompt | null => getPrompt(id))
  ipcMain.handle('prompts:create', (_, input: PromptCreateInput): Prompt => createPrompt(input))
  ipcMain.handle('prompts:update', (_, id: string, input: PromptUpdateInput): Prompt | null =>
    updatePrompt(id, input)
  )
  ipcMain.handle('prompts:delete', (_, id: string): boolean => deletePrompt(id))
  ipcMain.handle('prompts:duplicate', (_, id: string): Prompt | null => duplicatePrompt(id))
  ipcMain.handle('prompts:import', (_, filePath: string) => importFromFile(filePath))
  ipcMain.handle('prompts:export', (_, filePath: string) => exportToFile(filePath))

  ipcMain.handle('settings:get', (): AppSettings => getSettings())
  ipcMain.handle(
    'settings:update',
    (_, partial: Partial<AppSettings>): AppSettings => updateSettings(partial)
  )

  ipcMain.handle('clipboard:readText', (): string => clipboard.readText())
  ipcMain.handle('clipboard:writeText', (_, text: string): void => {
    clipboard.writeText(text)
  })

  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    const result = await dialog.showOpenDialog(options)
    return result
  })
  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    const result = await dialog.showSaveDialog(options)
    return result
  })

  ipcMain.handle('store:getDataPath', (): string => initStore())
  ipcMain.handle('store:openDataFolder', async (): Promise<void> => {
    const dataPath = initStore()
    const dir = path.dirname(dataPath)
    await shell.openPath(dir)
  })

  ipcMain.handle('hotkey:register', (_, accelerator: string): boolean => {
    const callback = onPaletteHotkey ?? (() => {})
    return hotkey.registerHotkey(accelerator, callback)
  })
  ipcMain.handle('hotkey:unregister', (): void => hotkey.unregisterHotkey())

  ipcMain.handle('palette:close', (): void => closePaletteWindow())

  ipcMain.handle('window:minimize', (): void => {
    const w = BrowserWindow.getFocusedWindow() ?? getMainWindow()
    if (w && !w.isDestroyed()) w.minimize()
  })
  ipcMain.handle('window:maximize', (): void => {
    const w = BrowserWindow.getFocusedWindow() ?? getMainWindow()
    if (w && !w.isDestroyed()) {
      if (w.isMaximized()) w.unmaximize()
      else w.maximize()
    }
  })
  ipcMain.handle('window:close', (): void => {
    const w = BrowserWindow.getFocusedWindow() ?? getMainWindow()
    if (w && !w.isDestroyed()) w.close()
  })
  ipcMain.handle('window:isMaximized', (): boolean => {
    const w = BrowserWindow.getFocusedWindow() ?? getMainWindow()
    return w != null && !w.isDestroyed() && w.isMaximized()
  })
}
