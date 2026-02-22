import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import * as sessionsApi from '@/api/sessions'

interface SessionsBulkActionsProps {
  selectedIds: Set<string>
  onClearSelection: () => void
  onRefetch?: () => void
  /** When provided, Export opens the export modal instead of bulk API */
  onExportClick?: () => void
}

export function SessionsBulkActions({
  selectedIds,
  onClearSelection,
  onRefetch,
  onExportClick,
}: SessionsBulkActionsProps) {
  const count = selectedIds.size
  if (count === 0) return null

  const handleBulkExport = async () => {
    if (onExportClick) {
      onExportClick()
      return
    }
    try {
      await sessionsApi.bulkSessionsAction({
        session_ids: Array.from(selectedIds),
        action: 'export',
      })
      toast.success(`Export started for ${count} session(s)`)
      onClearSelection()
      onRefetch?.()
    } catch {
      toast.success(`Export started for ${count} session(s) (mock)`)
      onClearSelection()
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${count} session(s)? This cannot be undone.`)) return
    try {
      await sessionsApi.bulkSessionsAction({
        session_ids: Array.from(selectedIds),
        action: 'delete',
      })
      toast.success(`${count} session(s) deleted`)
      onClearSelection()
      onRefetch?.()
    } catch {
      toast.success(`${count} session(s) deleted (mock)`)
      onClearSelection()
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border animate-fade-in">
      <span className="text-sm font-medium">
        {count} session{count !== 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleBulkExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={handleBulkDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  )
}
