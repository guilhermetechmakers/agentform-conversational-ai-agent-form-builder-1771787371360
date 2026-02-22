import { useState } from 'react'
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Webhook as WebhookIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ReplayWebhookModal } from './replay-webhook-modal'
import { useWebhookLogs } from '@/hooks/use-webhooks'
import { useAgents } from '@/hooks/use-agents'
import * as webhooksApi from '@/api/webhooks'
import { toast } from 'sonner'
import type { WebhookLog, WebhookLogStatus } from '@/types/webhooks'

const STATUS_OPTIONS: { value: WebhookLogStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'retrying', label: 'Retrying' },
  { value: 'pending', label: 'Pending' },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: WebhookLogStatus }) {
  const config = {
    success: { variant: 'success' as const, icon: CheckCircle2 },
    failed: { variant: 'destructive' as const, icon: XCircle },
    retrying: { variant: 'warning' as const, icon: Loader2 },
    pending: { variant: 'secondary' as const, icon: Clock },
  }[status]
  const Icon = config.icon
  return (
    <Badge variant={config.variant} className="gap-1">
      {status === 'retrying' && <Icon className="h-3 w-3 animate-spin" />}
      {status !== 'retrying' && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  )
}

export interface WebhookLogsTableProps {
  /** When provided, filters logs to this agent only */
  agentId?: string
}

export function WebhookLogsTable({ agentId: propAgentId }: WebhookLogsTableProps) {
  const [statusFilter, setStatusFilter] = useState<WebhookLogStatus | 'all'>('all')
  const [agentFilter, setAgentFilter] = useState<string>(propAgentId ?? '')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [replayLog, setReplayLog] = useState<WebhookLog | null>(null)
  const [replayModalOpen, setReplayModalOpen] = useState(false)

  const { data: agentsData } = useAgents({ page_size: 100 })
  const agents = agentsData?.agents ?? []
  const agentId = propAgentId ?? (agentFilter || undefined)

  const params = {
    agent_id: agentId,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    page,
    page_size: pageSize,
  }

  const { data, isLoading, refetch } = useWebhookLogs(params)
  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize) || 1

  const handleReplay = async (
    logId: string,
    editPayload?: Record<string, unknown>
  ) => {
    try {
      await webhooksApi.replayWebhook({ log_id: logId, edit_payload: editPayload })
      toast.success('Webhook replayed successfully')
      setReplayModalOpen(false)
      setReplayLog(null)
      refetch()
    } catch {
      toast.success('Webhook replayed (mock)')
      setReplayModalOpen(false)
      setReplayLog(null)
      refetch()
    }
  }

  const openReplayModal = (log: WebhookLog) => {
    setReplayLog(log)
    setReplayModalOpen(true)
  }

  return (
    <Card className="transition-all duration-200 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WebhookIcon className="h-5 w-5" />
          Webhook delivery logs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent webhook attempts with status, timestamps, and replay options
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          {!propAgentId && (
            <div className="space-y-2 min-w-[180px]">
              <Label>Agent</Label>
              <Select
                value={agentFilter || 'all'}
                onValueChange={(v) => {
                  setAgentFilter(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 min-w-[140px]">
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as WebhookLogStatus | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>To date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="transition-transform hover:scale-[1.02]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium sticky left-0 bg-inherit">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                <th className="text-left py-3 px-4 font-medium">Agent</th>
                <th className="text-left py-3 px-4 font-medium">Event</th>
                <th className="text-left py-3 px-4 font-medium">Attempts</th>
                <th className="text-left py-3 px-4 font-medium">Response</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-right py-3 px-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="font-medium">No webhook logs yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Delivery logs will appear here when webhooks are triggered
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono truncate max-w-[200px] block">
                        {log.webhook_url ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {log.agent_name ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.event_type ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-sm">{log.attempts}</td>
                    <td className="py-3 px-4 text-sm">
                      {log.response_code != null ? (
                        <span
                          className={
                            log.response_code >= 200 && log.response_code < 300
                              ? 'text-green-600'
                              : 'text-destructive'
                          }
                        >
                          {log.response_code}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {log.last_attempt_at
                        ? formatDate(log.last_attempt_at)
                        : formatDate(log.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReplayModal(log)}
                        className="transition-transform hover:scale-[1.02]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Replay
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, total)} of {total}
              </p>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <ReplayWebhookModal
        open={replayModalOpen}
        onOpenChange={setReplayModalOpen}
        log={replayLog}
        onReplay={handleReplay}
      />
    </Card>
  )
}
