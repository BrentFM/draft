import React from 'react'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { SheetHeader } from '@renderer/components/SheetHeader'
import { PromptDetail } from '@renderer/components/PromptDetail'
import type { Prompt } from '@renderer/lib/api'

interface PromptDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: Prompt | null
  onUpdate: (id: string, data: Partial<Prompt>) => Promise<unknown>
  onDelete: (id: string) => Promise<boolean>
  onDuplicate: (id: string) => Promise<Prompt | null>
  onCopyBody: (text: string) => void
  confirmBeforeDelete: boolean
}

export function PromptDetailSheet({
  open,
  onOpenChange,
  prompt,
  onUpdate,
  onDelete,
  onDuplicate,
  onCopyBody,
  confirmBeforeDelete
}: PromptDetailSheetProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        belowTitleBar
        className="fixed top-10 left-0 right-0 bottom-0 z-50 flex h-[calc(100vh-2.5rem)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 border-0 p-0 [data-state=open]:animate-none [data-state=closed]:animate-none sm:rounded-none [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader
          title={prompt?.title || 'Prompt'}
          onClose={() => onOpenChange(false)}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          <PromptDetail
            key={prompt?.id ?? 'empty'}
            prompt={prompt}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onCopyBody={onCopyBody}
            confirmBeforeDelete={confirmBeforeDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
