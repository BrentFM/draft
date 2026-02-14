import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { Prompt, PromptCreateInput, PromptUpdateInput } from '../shared/types/Prompt'
import type { AppSettings } from '../shared/types/Settings'
import { DATA_FILE_NAME, DEFAULT_SETTINGS, SCHEMA_VERSION } from '../shared/constants/defaults'

export interface StoreData {
  version: number
  prompts: Prompt[]
  settings: AppSettings
}

let dataPath: string
let cached: StoreData | null = null

function getDataPath(): string {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), DATA_FILE_NAME)
  }
  return dataPath
}

function ensureDir(): void {
  const dir = path.dirname(getDataPath())
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function load(): StoreData {
  if (cached) return cached
  ensureDir()
  const filePath = getDataPath()
  if (!fs.existsSync(filePath)) {
    cached = {
      version: SCHEMA_VERSION,
      prompts: [],
      settings: { ...DEFAULT_SETTINGS }
    }
    return cached
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as StoreData
    if (!data.prompts || !Array.isArray(data.prompts)) {
      data.prompts = []
    }
    if (!data.settings || typeof data.settings !== 'object') {
      data.settings = { ...DEFAULT_SETTINGS }
    }
    data.version = data.version ?? SCHEMA_VERSION
    cached = data
    return cached
  } catch {
    const backupPath = filePath + '.corrupt.' + Date.now()
    try {
      fs.copyFileSync(filePath, backupPath)
    } catch {
      // ignore backup failure
    }
    cached = {
      version: SCHEMA_VERSION,
      prompts: [],
      settings: { ...DEFAULT_SETTINGS }
    }
    return cached
  }
}

function save(): void {
  if (!cached) return
  ensureDir()
  const filePath = getDataPath()
  const tmpPath = filePath + '.tmp.' + Date.now()
  fs.writeFileSync(tmpPath, JSON.stringify(cached, null, 2), 'utf-8')
  fs.renameSync(tmpPath, filePath)
}

export function initStore(): string {
  load()
  return getDataPath()
}

export function listPrompts(): Prompt[] {
  const data = load()
  return [...data.prompts]
}

export function getPrompt(id: string): Prompt | null {
  const data = load()
  return data.prompts.find((p) => p.id === id) ?? null
}

export function createPrompt(input: PromptCreateInput): Prompt {
  const data = load()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const prompt: Prompt = {
    id,
    title: input.title ?? '',
    body: input.body ?? '',
    tags: input.tags ?? [],
    collection: input.collection,
    modelHint: input.modelHint,
    isFavorite: input.isFavorite ?? false,
    createdAt: now,
    updatedAt: now
  }
  data.prompts.push(prompt)
  save()
  return prompt
}

export function updatePrompt(id: string, input: PromptUpdateInput): Prompt | null {
  const data = load()
  const index = data.prompts.findIndex((p) => p.id === id)
  if (index === -1) return null
  const existing = data.prompts[index]
  const updated: Prompt = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  }
  data.prompts[index] = updated
  save()
  return updated
}

export function deletePrompt(id: string): boolean {
  const data = load()
  const index = data.prompts.findIndex((p) => p.id === id)
  if (index === -1) return false
  data.prompts.splice(index, 1)
  save()
  return true
}

export function duplicatePrompt(id: string): Prompt | null {
  const existing = getPrompt(id)
  if (!existing) return null
  const title =
    existing.title.length > 100
      ? 'Copy of ' + existing.title.slice(0, 97) + '...'
      : 'Copy of ' + existing.title
  return createPrompt({
    title,
    body: existing.body,
    tags: [...existing.tags],
    collection: existing.collection,
    modelHint: existing.modelHint,
    isFavorite: existing.isFavorite
  })
}

export function getSettings(): AppSettings {
  const data = load()
  return { ...DEFAULT_SETTINGS, ...data.settings }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const data = load()
  data.settings = { ...data.settings, ...partial }
  save()
  return data.settings
}

export interface ImportResult {
  imported: number
  updated: number
}

export function importFromFile(filePath: string): ImportResult {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw) as { prompts?: Prompt[] }
  const incoming = Array.isArray(parsed.prompts) ? parsed.prompts : []
  const data = load()
  let imported = 0
  let updated = 0
  for (const p of incoming) {
    if (!p.id || !p.title) continue
    const index = data.prompts.findIndex((x) => x.id === p.id)
    const now = new Date().toISOString()
    const normalized: Prompt = {
      id: p.id,
      title: p.title,
      body: p.body ?? '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      collection: p.collection,
      modelHint: p.modelHint,
      isFavorite: p.isFavorite ?? false,
      createdAt: p.createdAt ?? now,
      updatedAt: now
    }
    if (index >= 0) {
      data.prompts[index] = { ...normalized, createdAt: data.prompts[index].createdAt }
      updated++
    } else {
      data.prompts.push(normalized)
      imported++
    }
  }
  save()
  return { imported, updated }
}

export function exportToFile(filePath: string): number {
  const data = load()
  const payload = { version: SCHEMA_VERSION, prompts: data.prompts }
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  return data.prompts.length
}
