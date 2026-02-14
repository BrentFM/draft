import { useState, useCallback, useEffect } from 'react'
import { api, type Prompt, type PromptCreateInput, type PromptUpdateInput } from '@renderer/lib/api'

export function usePrompts(): {
  prompts: Prompt[]
  selected: Prompt | null
  loading: boolean
  error: string | null
  selectId: (id: string | null) => void
  refresh: () => Promise<void>
  create: (input: PromptCreateInput) => Promise<Prompt>
  update: (id: string, input: PromptUpdateInput) => Promise<Prompt | null>
  remove: (id: string) => Promise<boolean>
  duplicate: (id: string) => Promise<Prompt | null>
} {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.prompts.list()
      setPrompts(list)
      if (selectedId && !list.some((p) => p.id === selectedId)) {
        setSelectedId(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const selected = prompts.find((p) => p.id === selectedId) ?? null

  const selectId = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const create = useCallback(
    async (input: PromptCreateInput): Promise<Prompt> => {
      const created = await api.prompts.create(input)
      await refresh()
      setSelectedId(created.id)
      return created
    },
    [refresh]
  )

  const update = useCallback(
    async (id: string, input: PromptUpdateInput): Promise<Prompt | null> => {
      const updated = await api.prompts.update(id, input)
      if (updated) await refresh()
      return updated
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await api.prompts.delete(id)
      if (ok) {
        if (selectedId === id) setSelectedId(null)
        await refresh()
      }
      return ok
    },
    [refresh, selectedId]
  )

  const duplicate = useCallback(
    async (id: string): Promise<Prompt | null> => {
      const dup = await api.prompts.duplicate(id)
      if (dup) {
        await refresh()
        setSelectedId(dup.id)
      }
      return dup
    },
    [refresh]
  )

  return {
    prompts,
    selected,
    loading,
    error,
    selectId,
    refresh,
    create,
    update,
    remove,
    duplicate
  }
}
