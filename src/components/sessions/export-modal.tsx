import { useState } from 'react'
import { Download, Loader2, FileText, FileJson } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type ExportFormat = 'csv' | 'json'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionIds: string[]
  onExport: (format: ExportFormat, sessionIds: string[]) => Promise<void>
}

export function ExportModal({
  open,
  onOpenChange,
  sessionIds,
  onExport,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(format, sessionIds)
      onOpenChange(false)
    } finally {
      setIsExporting(false)
    }
  }

  const count = sessionIds.length
  const label = count === 1 ? 'session' : 'sessions'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showClose={!isExporting}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {label}
          </DialogTitle>
          <DialogDescription>
            Choose an export format for {count} {label}. The download will start
            shortly after confirmation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-3">
            <Label>Format</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-lg border-2 p-4 transition-all duration-200',
                  format === 'csv'
                    ? 'border-primary bg-primary/10 shadow-card'
                    : 'border-border hover:border-primary/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                )}
              >
                <FileText className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <p className="font-medium">CSV</p>
                  <p className="text-sm text-muted-foreground">
                    Spreadsheet-friendly format
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-lg border-2 p-4 transition-all duration-200',
                  format === 'json'
                    ? 'border-primary bg-primary/10 shadow-card'
                    : 'border-border hover:border-primary/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                )}
              >
                <FileJson className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <p className="font-medium">JSON</p>
                  <p className="text-sm text-muted-foreground">
                    Full structured data
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
