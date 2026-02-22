import { useCallback, useMemo } from 'react'
import { FileText, Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { debounce } from '@/lib/utils'
import type { AuditLogEntry, AuditLogAction, AuditLogStatus } from '@/types/compliance'

const ACTION_LABELS: Record<AuditLogAction, string> = {
  role_change: 'Role change',
  compliance_setting_change: 'Compliance setting',
  agent_access_modification: 'Agent access',
  login: 'Login',
  logout: 'Logout',
  webhook_delivery: 'Webhook delivery',
  error: 'Error',
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusIcon(status: AuditLogStatus) {
  switch (status) {
    case 'success':
      return CheckCircle
    case 'failure':
      return XCircle
    default:
      return Clock
  }
}

function statusVariant(
  status: AuditLogStatus
): 'default' | 'destructive' | 'secondary' {
  switch (status) {
    case 'success':
      return 'default'
    case 'failure':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function logsToCsv(logs: AuditLogEntry[]): string {
  const header = 'Date,User,Action,Status,Details'
  const rows = logs.map(
    (l) =>
      `${formatTimestamp(l.timestamp)},"${l.user_name ?? l.user_email ?? l.user_id}",${ACTION_LABELS[l.action] ?? l.action},${l.status},"${(l.details ?? '').replace(/"/g, '""')}"`
  )
  return [header, ...rows].join('\n')
}

interface AuditLogsTableProps {
  logs: AuditLogEntry[]
  isLoading?: boolean
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  actionFilter?: string
  onActionFilterChange?: (value: string) => void
  userFilter?: string
  onUserFilterChange?: (value: string) => void
  onExport?: () => void
}

export function AuditLogsTable({
  logs,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  actionFilter = '',
  onActionFilterChange,
  userFilter = '',
  onUserFilterChange,
  onExport,
}: AuditLogsTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const debouncedUserFilter = useMemo(
    () => debounce((v: string) => onUserFilterChange?.(v), 300),
    [onUserFilterChange]
  )

  const handleExport = useCallback(() => {
    const csv = logsToCsv(logs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onExport?.()
  }, [logs, onExport])

  if (logs.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No audit logs found</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Try adjusting your filters or date range.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={logs.length === 0}
            className="transition-transform hover:scale-[1.02]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search by user..."
              className="pl-9"
              defaultValue={userFilter}
              onChange={(e) => debouncedUserFilter(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687076]" />
          </div>
          <Select value={actionFilter} onValueChange={onActionFilterChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {(Object.keys(ACTION_LABELS) as AuditLogAction[]).map((action) => (
                <SelectItem key={action} value={action}>
                  {ACTION_LABELS[action]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="From"
            value={dateFrom}
            onChange={(e) => onDateFromChange?.(e.target.value)}
            className="w-full sm:w-40"
          />
          <Input
            type="date"
            placeholder="To"
            value={dateTo}
            onChange={(e) => onDateToChange?.(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#EDEDED]">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Action</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#EDEDED]">
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                  </tr>
                ))
              ) : (
                logs.map((log) => {
                  const StatusIcon = statusIcon(log.status)
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-[#687076]">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {log.user_name ?? log.user_email ?? log.user_id}
                      </td>
                      <td className="py-3 px-4">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant(log.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#687076] max-w-xs truncate">
                        {log.details ?? '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#EDEDED]">
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#687076]">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange?.(Number(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-[#687076] px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
