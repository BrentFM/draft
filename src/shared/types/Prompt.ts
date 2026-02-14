export type PromptId = string

export interface Prompt {
  id: PromptId
  title: string
  body: string
  tags: string[]
  collection?: string
  modelHint?: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export type PromptCreateInput = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: never }

export type PromptUpdateInput = Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>
