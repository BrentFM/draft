export type ThemeMode = 'system' | 'light' | 'dark'

export interface AppSettings {
  theme: ThemeMode
  globalHotkey: string
  compactMode: boolean
  dbPath?: string
  closePaletteOnCopy?: boolean
  confirmBeforeDelete?: boolean
}
