import { FileText, Search, Webhook, AlertTriangle, Shield } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { debounce } from '@/lib/utils'
import type { AdminLog, LogType } from '@/types/admin'

interface LogsViewerProps {
  logs: AdminLog[]
  isLoading?: boolean
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  typeFilter?: string
  onTypeFilterChange?: (value: string) => void
  search?: string
  onSearchChange?: (value: string) => void
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
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

function logTypeIcon(type: LogType) {
  switch (type) {
    case 'webhook':
      return Webhook
    case 'error':
      return AlertTriangle
    case 'security':
      return Shield
    default:
      return FileText
  }
}

function logTypeVariant(type: LogType): 'default' | 'destructive' | 'warning' {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'security':
      return 'warning'
    default:
      return 'default'
  }
}

export function LogsViewer({
  logs,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  typeFilter = '',
  onTypeFilterChange,
  search = '',
  onSearchChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
}: LogsViewerProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const debouncedSearch = debounce((v: string) => onSearchChange?.(v), 300)

  if (logs.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Logs & Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No logs found</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Try adjusting your filters or date range.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-[#EDEDED]">
      <CardHeader className="space-y-4">
        <CardTitle>Logs & Audit</CardTitle>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search logs..."
              className="pl-9"
              defaultValue={search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687076]" />
          </div>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="security">Security</SelectItem>
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
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#EDEDED]"
              >
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))
          ) : (
            logs.map((log) => {
              const Icon = logTypeIcon(log.type)
              return (
                <div
                  key={log.log_id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border border-[#EDEDED]',
                    'transition-all duration-200 hover:bg-muted/30'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      log.type === 'error' && 'bg-destructive/20',
                      log.type === 'security' && 'bg-primary/20',
                      log.type === 'webhook' && 'bg-secondary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        log.type === 'error' && 'text-destructive',
                        log.type === 'security' && 'text-primary',
                        log.type === 'webhook' && 'text-secondary-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#191A1D]">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={logTypeVariant(log.type)}>{log.type}</Badge>
                      <span className="text-xs text-[#687076]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
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
