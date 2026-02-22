import { Bot, Flag, Eye, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { debounce } from '@/lib/utils'
import type { AdminAgent, AgentStatus } from '@/types/admin'

interface AgentListProps {
  agents: AdminAgent[]
  isLoading?: boolean
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onTakeDown?: (id: string) => void
  onFlag?: (id: string) => void
  onReview?: (id: string) => void
  search?: string
  onSearchChange?: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusVariant(status: AgentStatus): 'success' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'success'
    case 'flagged':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function AgentList({
  agents,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onTakeDown,
  onFlag,
  onReview,
  search = '',
  onSearchChange,
  statusFilter = '',
  onStatusFilterChange,
}: AgentListProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const debouncedSearch = debounce((v: string) => onSearchChange?.(v), 300)

  if (agents.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No agents found</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-[#EDEDED]">
      <CardHeader className="space-y-4">
        <CardTitle>Agents</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search agents..."
              className="pl-9"
              defaultValue={search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Bot className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687076]" />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#EDEDED]"
              >
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))
          ) : (
            agents.map((agent) => (
              <div
                key={agent.agent_id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border border-[#EDEDED]',
                  'transition-all duration-200 hover:shadow-card hover:border-primary/20'
                )}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#191A1D]">{agent.name}</p>
                  <p className="text-sm text-[#687076]">
                    Created {formatDate(agent.created_at)}
                  </p>
                </div>
                <Badge variant={statusVariant(agent.status)}>{agent.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {agent.status === 'active' && (
                      <DropdownMenuItem
                        onClick={() => onTakeDown?.(agent.agent_id)}
                      >
                        Take down
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onFlag?.(agent.agent_id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Flag for review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReview?.(agent.agent_id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review sessions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
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
