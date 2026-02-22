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
  field_name: string
  field_value: string
}

export const DEFAULT_SESSIONS_FILTERS: SessionsFilterState = {
  search: '',
  agent_id: '',
  status: 'all',
  tag: '',
  date_from: '',
  date_to: '',
  field_name: '',
  field_value: '',
}

interface SessionsFiltersProps {
  filters: SessionsFilterState
  onFiltersChange: (filters: SessionsFilterState) => void
  onSearchChange: (search: string) => void
  agents?: Array<{ id: string; name: string }>
  availableTags?: string[]
  availableFields?: string[]
}

const STATUS_OPTIONS: { value: SessionsFilterState['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'in-progress', label: 'In progress' },
]

export function SessionsFilters({
  filters,
  onFiltersChange,
  onSearchChange,
  agents = [],
  availableTags = [],
  availableFields = [],
}: SessionsFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.agent_id ||
    filters.status !== 'all' ||
    filters.tag ||
    filters.date_from ||
    filters.date_to ||
    filters.field_name ||
    filters.field_value

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      agent_id: '',
      status: 'all',
      tag: '',
      date_from: '',
      date_to: '',
      field_name: '',
      field_value: '',
    })
    onSearchChange('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
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
            <SelectTrigger className="w-[140px]">
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
              {availableTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              className="w-[140px]"
              value={filters.date_from}
              onChange={(e) =>
                onFiltersChange({ ...filters, date_from: e.target.value })
              }
              aria-label="Date from"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              className="w-[140px]"
              value={filters.date_to}
              onChange={(e) =>
                onFiltersChange({ ...filters, date_to: e.target.value })
              }
              aria-label="Date to"
            />
          </div>
          {availableFields.length > 0 && (
            <>
              <Select
                value={filters.field_name || '__all__'}
                onValueChange={(v) =>
                  onFiltersChange({
                    ...filters,
                    field_name: v === '__all__' ? '' : v,
                    field_value: v === '__all__' ? '' : filters.field_value,
                  })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All fields</SelectItem>
                  {availableFields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.field_name && (
                <Input
                  placeholder="Field value"
                  className="w-[140px]"
                  value={filters.field_value}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, field_value: e.target.value })
                  }
                />
              )}
            </>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
