import { useCallback, useEffect, useState } from 'react'
import { FileText, Download, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAuditLogs } from '@/api/admin'
import type { AuditLog, AuditLogAction } from '@/types/admin'
import { toast } from 'sonner'

const ACTION_LABELS: Record<AuditLogAction, string> = {
  role_change: 'Role change',
  compliance_setting_change: 'Compliance setting',
  agent_access_modification: 'Agent access',
  user_login: 'User login',
  user_logout: 'User logout',
}

const STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'secondary'> = {
  success: 'success',
  failure: 'destructive',
  pending: 'secondary',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function exportToCsv(logs: AuditLog[]): void {
  const headers = ['Date', 'User', 'Action', 'Status', 'Details']
  const rows = logs.map((l) => [
    formatDate(l.timestamp),
    l.user_name ?? l.user_email ?? l.user_id,
    ACTION_LABELS[l.action] ?? l.action,
    l.status,
    l.details ?? '',
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  const loadLogs = useCallback(() => {
    setIsLoading(true)
    fetchAuditLogs({
      page,
      pageSize,
      user: userFilter || undefined,
      action: actionFilter || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    })
      .then((res) => {
        setLogs(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        toast.error('Failed to load audit logs')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [page, pageSize, userFilter, actionFilter, dateFrom, dateTo])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleExport = useCallback(async () => {
    setExportLoading(true)
    try {
      const res = await fetchAuditLogs({ pageSize: 1000, user: userFilter || undefined, action: actionFilter || undefined, from: dateFrom || undefined, to: dateTo || undefined })
      exportToCsv(res.data)
      toast.success('Audit logs exported')
    } catch {
      toast.error('Failed to export logs')
    } finally {
      setExportLoading(false)
    }
  }, [userFilter, actionFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Track role changes, compliance updates, and agent access modifications
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportLoading || logs.length === 0}
            className="transition-transform hover:scale-[1.02] shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Input
              placeholder="Filter by user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687076]" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {(Object.keys(ACTION_LABELS) as AuditLogAction[]).map((a) => (
                <SelectItem key={a} value={a}>
                  {ACTION_LABELS[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
            className="w-full sm:w-36"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
            className="w-full sm:w-36"
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
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-[#687076]">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {log.user_name ?? log.user_email ?? log.user_id}
                    </td>
                    <td className="py-3 px-4">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={STATUS_VARIANTS[log.status] ?? 'secondary'}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#687076] max-w-[200px] truncate">
                      {log.details ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-[#EDEDED]">
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#687076]">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
