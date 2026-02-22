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
import type { AgentStatus } from '@/types/agents'

export interface FilterState {
  search: string
  status: AgentStatus | 'all'
  tag: string
  sort: 'name' | 'created_at' | 'sessions' | 'conversion'
}

interface FilterControlsProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearchChange: (search: string) => void
  placeholder?: string
}

const STATUS_OPTIONS: { value: FilterState['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Published', label: 'Published' },
  { value: 'Unpublished', label: 'Unpublished' },
  { value: 'On Progress', label: 'On Progress' },
]

const SORT_OPTIONS: { value: FilterState['sort']; label: string }[] = [
  { value: 'created_at', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'conversion', label: 'Conversion rate' },
]

const TAG_OPTIONS = [
  { value: '__all__', label: 'All tags' },
  { value: 'lead-capture', label: 'Lead capture' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'support', label: 'Support' },
]

export function FilterControls({
  filters,
  onFiltersChange,
  onSearchChange,
  placeholder = 'Search agents...',
}: FilterControlsProps) {
  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.tag ||
    filters.sort !== 'created_at'

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      tag: '',
      sort: 'created_at',
    })
    onSearchChange('')
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="pl-9 pr-9"
            value={filters.search}
            onChange={(e) => {
              const v = e.target.value
              onFiltersChange({ ...filters, search: v })
              onSearchChange(v)
            }}
            aria-label="Search agents"
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
            value={filters.status}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v as FilterState['status'] })
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
              {TAG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sort}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, sort: v as FilterState['sort'] })
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
