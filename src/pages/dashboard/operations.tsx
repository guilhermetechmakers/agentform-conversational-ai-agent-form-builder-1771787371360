import { useState, useCallback } from 'react'
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Upload,
  RefreshCw,
  FileDown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LoadingSkeleton,
  ProgressIndicator,
  ConfirmationModal,
} from '@/components/operations'
import { useOperations } from '@/hooks/use-operations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { OperationLog, OperationType } from '@/types/operations'

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function operationTypeLabel(type: OperationType): string {
  const labels: Record<string, string> = {
    publish: 'Publish',
    delete: 'Delete',
    webhook_replay: 'Webhook Replay',
    export: 'Export',
  }
  return labels[type] ?? type.replace(/_/g, ' ')
}

function StatusBadge({ status }: { status: OperationLog['status'] }) {
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        In progress
      </Badge>
    )
  }
  if (status === 'success') {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Success
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      Error
    </Badge>
  )
}

function OperationIcon({ type }: { type: OperationType }) {
  const iconProps = { className: 'h-5 w-5' }
  switch (type) {
    case 'publish':
      return <Upload {...iconProps} />
    case 'webhook_replay':
      return <RefreshCw {...iconProps} />
    case 'export':
      return <FileDown {...iconProps} />
    default:
      return <Activity {...iconProps} />
  }
}

export function OperationsPage() {
  const { operations, isLoading, refetch } = useOperations()
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearLogs = useCallback(async () => {
    setIsClearing(true)
    try {
      // Placeholder: API would clear completed operations
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Operation logs cleared')
      refetch()
    } catch {
      toast.error('Failed to clear logs')
    } finally {
      setIsClearing(false)
    }
  }, [refetch])

  const activeOperations = operations.filter((o) => o.status === 'pending')
  const hasCompleted = operations.some(
    (o) => o.status === 'success' || o.status === 'error'
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations</h1>
          <p className="text-muted-foreground mt-1">
            Track publish, webhook replay, and other operation statuses
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="transition-transform hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" />
      ) : operations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No operations yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-center">
              Operations from publishing agents, webhook replays, and exports will
              appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeOperations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Operations in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeOperations.map((op) => (
                  <div
                    key={op.id}
                    className="rounded-lg border border-border p-4 space-y-3 transition-all hover:shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <OperationIcon type={op.operationType} />
                        </div>
                        <div>
                          <p className="font-medium">
                            {operationTypeLabel(op.operationType)}
                          </p>
                          {op.message && (
                            <p className="text-sm text-muted-foreground">
                              {op.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={op.status} />
                    </div>
                    <ProgressIndicator
                      value={op.progress}
                      label="Progress"
                      showPercentage
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Operations</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Completed and failed operations
                </p>
              </div>
              {hasCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClearModalOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear logs
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operations
                  .filter((o) => o.status !== 'pending')
                  .map((op) => (
                    <div
                      key={op.id}
                      className={cn(
                        'flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-all hover:shadow-card',
                        op.status === 'error' && 'border-destructive/30 bg-destructive/5'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                            op.status === 'success'
                              ? 'bg-[#E1F8E7] text-green-700'
                              : 'bg-destructive/10 text-destructive'
                          )}
                        >
                          <OperationIcon type={op.operationType} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {operationTypeLabel(op.operationType)}
                          </p>
                          {op.message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {op.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTimestamp(op.timestamp)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={op.status} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmationModal
        open={clearModalOpen}
        onOpenChange={setClearModalOpen}
        title="Clear operation logs?"
        description="This will remove all completed and failed operations from the list. This action cannot be undone."
        confirmLabel="Clear logs"
        variant="destructive"
        onConfirm={handleClearLogs}
        isLoading={isClearing}
      />
    </div>
  )
}
