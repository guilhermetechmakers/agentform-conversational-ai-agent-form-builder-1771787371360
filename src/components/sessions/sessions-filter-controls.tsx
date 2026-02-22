import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SessionStatus } from '@/types/sessions'

export interface SessionsFilterState {
  search: string
  agent_id: string
  status: SessionStatus | 'all'
  tag: string
  date_from: string
  date_to: string
  sort: string
  sort_dir: 'asc' | 'desc'
}

interface SessionsFilterControlsProps {
  filters: SessionsFilterState
  onFiltersChange: (filters: SessionsFilterState) => void
  onSearchChange: (search: string) => void
  agents?: Array<{ id: string; name: string }>
  tags?: string[]
}

const STATUS_OPTIONS: { value: SessionsFilterState['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'created_at', label: 'Created date' },
  { value: 'agent_name', label: 'Agent name' },
  { value: 'status', label: 'Status' },
  { value: 'visitor_identifier', label: 'Visitor' },
]

export const DEFAULT_SESSIONS_FILTERS: SessionsFilterState = {
  search: '',
  agent_id: '',
  status: 'all',
  tag: '',
  date_from: '',
  date_to: '',
  sort: 'created_at',
  sort_dir: 'desc',
}

export function SessionsFilterControls({
  filters,
  onFiltersChange,
  onSearchChange,
  agents = [],
  tags = ['lead', 'feedback', 'support'],
}: SessionsFilterControlsProps) {
  const hasActiveFilters =
    filters.search ||
    filters.agent_id ||
    filters.status !== 'all' ||
    filters.tag ||
    filters.date_from ||
    filters.date_to ||
    filters.sort !== 'created_at'

  const clearFilters = () => {
    onFiltersChange({
      ...DEFAULT_SESSIONS_FILTERS,
    })
    onSearchChange('')
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            className="pl-9 pr-9"
            value={filters.search}
            onChange={(e) => {
              const v = e.target.value
              onFiltersChange({ ...filters, search: v })
              onSearchChange(v)
            }}
            aria-label="Search sessions"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                onFiltersChange({ ...filters, search: '' })
                onSearchChange('')
              }}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.agent_id || '__all__'}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, agent_id: v === '__all__' ? '' : v })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v as SessionsFilterState['status'] })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.tag || '__all__'}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, tag: v === '__all__' ? '' : v })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              type="date"
              className="w-[140px]"
              value={filters.date_from}
              onChange={(e) =>
                onFiltersChange({ ...filters, date_from: e.target.value })
              }
              placeholder="From"
            />
            <Input
              type="date"
              className="w-[140px]"
              value={filters.date_to}
              onChange={(e) =>
                onFiltersChange({ ...filters, date_to: e.target.value })
              }
              placeholder="To"
            />
          </div>
          <Select
            value={filters.sort}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, sort: v })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
