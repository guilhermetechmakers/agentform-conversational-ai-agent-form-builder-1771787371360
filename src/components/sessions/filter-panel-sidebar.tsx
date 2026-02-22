import { useState, useCallback } from 'react'
import { Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SessionsFilterState } from '@/types/sessions-filters-state'

const STATUS_OPTIONS: { value: SessionsFilterState['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'in-progress', label: 'In progress' },
]

interface FilterContentProps {
  filters: SessionsFilterState
  onFiltersChange: (filters: SessionsFilterState) => void
  hasActiveFilters: boolean
  clearFilters: () => void
  agents: Array<{ id: string; name: string }>
  availableTags: string[]
  availableFields: string[]
}

function FilterContent({
  filters,
  onFiltersChange,
  hasActiveFilters,
  clearFilters,
  agents,
  availableTags,
  availableFields,
}: FilterContentProps) {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground text-xs h-8"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Metadata Filters */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Metadata
        </h4>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Agent</Label>
            <Select
              value={filters.agent_id || '__all__'}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, agent_id: v === '__all__' ? '' : v })
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="All agents" />
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
          </div>
          <div>
            <Label className="text-sm">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, status: v as SessionsFilterState['status'] })
              }
            >
              <SelectTrigger className="mt-1.5">
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
          </div>
          <div>
            <Label className="text-sm">Date range</Label>
            <div className="flex flex-col gap-2 mt-1.5">
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_from: e.target.value })
                }
                aria-label="Date from"
              />
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_to: e.target.value })
                }
                aria-label="Date to"
              />
            </div>
          </div>
          {availableTags.length > 0 && (
            <div>
              <Label className="text-sm">Tag</Label>
              <Select
                value={filters.tag || '__all__'}
                onValueChange={(v) =>
                  onFiltersChange({ ...filters, tag: v === '__all__' ? '' : v })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All tags" />
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
            </div>
          )}
        </div>
      </div>

      {/* Extracted Fields Filters */}
      {availableFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Extracted Fields
          </h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Field name</Label>
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
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All fields" />
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
            </div>
            {filters.field_name && (
              <div>
                <Label className="text-sm">Field value</Label>
                <Input
                  placeholder="Filter by value..."
                  className="mt-1.5"
                  value={filters.field_value}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, field_value: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface FilterPanelSidebarProps {
  filters: SessionsFilterState
  onFiltersChange: (filters: SessionsFilterState) => void
  /** Called when filters are cleared, to sync search input and URL */
  onSearchClear?: () => void
  agents?: Array<{ id: string; name: string }>
  availableTags?: string[]
  availableFields?: string[]
  className?: string
}

export function FilterPanelSidebar({
  filters,
  onFiltersChange,
  onSearchClear,
  agents = [],
  availableTags = [],
  availableFields = [],
  className,
}: FilterPanelSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.agent_id ||
    filters.status !== 'all' ||
    filters.tag ||
    filters.date_from ||
    filters.date_to ||
    filters.field_name ||
    filters.field_value
  )

  const clearFilters = useCallback(() => {
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
    onSearchClear?.()
  }, [onFiltersChange, onSearchClear])

  const filterContentProps: FilterContentProps = {
    filters,
    onFiltersChange,
    hasActiveFilters,
    clearFilters,
    agents,
    availableTags,
    availableFields,
  }

  return (
    <>
      {/* Desktop: Collapsible sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-12' : 'w-64',
          className
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              aria-label="Expand filters"
              className="transition-transform hover:scale-[1.02]"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Filter className="h-5 w-5 text-muted-foreground mt-4" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end p-2 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse filters"
                className="transition-transform hover:scale-[1.02]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <FilterContent {...filterContentProps} />
            </ScrollArea>
          </>
        )}
      </aside>

      {/* Mobile: Toggle button + overlay */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 animate-in"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-card border-r border-border shadow-xl animate-in',
                'md:hidden'
              )}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <FilterContent {...filterContentProps} />
              </ScrollArea>
            </aside>
          </>
        )}
      </div>
    </>
  )
}
