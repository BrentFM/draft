import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const menuChannels = ['new-prompt', 'import', 'export', 'copy', 'about'] as const
const menuCallbacks = new Map<string, () => void>()
menuChannels.forEach((channel) => {
  ipcRenderer.on(channel, () => menuCallbacks.get(channel)?.())
})

export type Prompt = import('../shared/types/Prompt').Prompt
export type PromptCreateInput = import('../shared/types/Prompt').PromptCreateInput
export type PromptUpdateInput = import('../shared/types/Prompt').PromptUpdateInput
export type AppSettings = import('../shared/types/Settings').AppSettings
export type ImportResult = { imported: number; updated: number }

const api = {
  prompts: {
    list: (): Promise<Prompt[]> => ipcRenderer.invoke('prompts:list'),
    get: (id: string): Promise<Prompt | null> => ipcRenderer.invoke('prompts:get', id),
    create: (input: PromptCreateInput): Promise<Prompt> =>
      ipcRenderer.invoke('prompts:create', input),
    update: (id: string, input: PromptUpdateInput): Promise<Prompt | null> =>
      ipcRenderer.invoke('prompts:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('prompts:delete', id),
    duplicate: (id: string): Promise<Prompt | null> => ipcRenderer.invoke('prompts:duplicate', id),
    import: (filePath: string): Promise<ImportResult> =>
      ipcRenderer.invoke('prompts:import', filePath),
    export: (filePath: string): Promise<number> => ipcRenderer.invoke('prompts:export', filePath)
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (partial: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke('settings:update', partial)
  },
  clipboard: {
    readText: (): Promise<string> => ipcRenderer.invoke('clipboard:readText'),
    writeText: (text: string): Promise<void> => ipcRenderer.invoke('clipboard:writeText', text)
  },
  dialog: {
    showOpenDialog: (options: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: Electron.SaveDialogOptions) =>
      ipcRenderer.invoke('dialog:showSaveDialog', options)
  },
  store: {
    getDataPath: (): Promise<string> => ipcRenderer.invoke('store:getDataPath'),
    openDataFolder: (): Promise<void> => ipcRenderer.invoke('store:openDataFolder')
  },
  hotkey: {
    register: (accelerator: string): Promise<boolean> =>
      ipcRenderer.invoke('hotkey:register', accelerator),
    unregister: (): Promise<void> => ipcRenderer.invoke('hotkey:unregister')
  },
  palette: {
    close: (): Promise<void> => ipcRenderer.invoke('palette:close')
  },
  menu: {
    on: (channel: string, callback: () => void): void => {
      menuCallbacks.set(channel, callback)
    }
  },
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized')
  },
  platform: process.platform as 'darwin' | 'win32' | 'linux'
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as unknown as { electron: typeof electronAPI }).electron = electronAPI
  ;(window as unknown as { api: typeof api }).api = api
}
