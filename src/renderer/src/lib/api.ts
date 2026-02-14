import type { Prompt, PromptCreateInput, PromptUpdateInput } from '../../../shared/types/Prompt'
import type { AppSettings } from '../../../shared/types/Settings'

export type ImportResult = { imported: number; updated: number }

declare global {
  interface Window {
    api: {
      prompts: {
        list: () => Promise<Prompt[]>
        get: (id: string) => Promise<Prompt | null>
        create: (input: PromptCreateInput) => Promise<Prompt>
        update: (id: string, input: PromptUpdateInput) => Promise<Prompt | null>
        delete: (id: string) => Promise<boolean>
        duplicate: (id: string) => Promise<Prompt | null>
        import: (filePath: string) => Promise<ImportResult>
        export: (filePath: string) => Promise<number>
      }
      settings: {
        get: () => Promise<AppSettings>
        update: (partial: Partial<AppSettings>) => Promise<AppSettings>
      }
      clipboard: {
        readText: () => Promise<string>
        writeText: (text: string) => Promise<void>
      }
      dialog: {
        showOpenDialog: (options: {
          title?: string
          defaultPath?: string
          filters?: { name: string; extensions: string[] }[]
        }) => Promise<{ canceled: boolean; filePaths: string[] }>
        showSaveDialog: (options: {
          title?: string
          defaultPath?: string
          filters?: { name: string; extensions: string[] }[]
        }) => Promise<{ canceled: boolean; filePath?: string }>
      }
      store: { getDataPath: () => Promise<string>; openDataFolder: () => Promise<void> }
      hotkey: {
        register: (accelerator: string) => Promise<boolean>
        unregister: () => Promise<void>
      }
      palette: { close: () => Promise<void> }
      menu: { on: (channel: string, callback: () => void) => void }
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
        isMaximized: () => Promise<boolean>
      }
      platform: 'darwin' | 'win32' | 'linux'
    }
  }
}

export const api = window.api

export type { Prompt, PromptCreateInput, PromptUpdateInput, AppSettings }
