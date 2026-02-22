import { useState } from 'react'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SessionsFilters } from './sessions-filters'
import type { SessionsFilterState } from './sessions-filters'
export interface FilterPanelProps {
  filters: SessionsFilterState
  onFiltersChange: (filters: SessionsFilterState) => void
  onSearchChange: (search: string) => void
  agents?: Array<{ id: string; name: string }>
  availableTags?: string[]
  availableFields?: string[]
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onSearchChange,
  agents = [],
  availableTags = [],
  availableFields = [],
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: FilterPanelProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isControlled = controlledCollapsed !== undefined
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed
  const setCollapsed = isControlled
    ? (v: boolean) => onCollapsedChange?.(v)
    : setInternalCollapsed

  return (
    <div
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-14' : 'w-64 min-w-[256px]'
      )}
      role="complementary"
      aria-label="Session filters"
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        {!collapsed && (
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand filter panel' : 'Collapse filter panel'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          <SessionsFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onSearchChange={onSearchChange}
            agents={agents}
            availableTags={availableTags}
            availableFields={availableFields}
            layout="vertical"
            hideSearch
          />
        </div>
      )}
    </div>
  )
}
