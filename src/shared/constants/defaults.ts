import type { AppSettings } from '../types/Settings'

export const DEFAULT_HOTKEY = 'CommandOrControl+Shift+Space'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  globalHotkey: DEFAULT_HOTKEY,
  compactMode: false,
  closePaletteOnCopy: true,
  confirmBeforeDelete: true
}

export const DATA_FILE_NAME = 'prompts.json'
export const SCHEMA_VERSION = 1
