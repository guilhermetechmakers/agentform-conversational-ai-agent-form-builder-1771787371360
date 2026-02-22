import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/types/sessions'

const STATUS_CHIPS: { value: SessionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'in-progress', label: 'In progress' },
]

interface StatusFilterChipsProps {
  value: SessionStatus | 'all'
  onChange: (value: SessionStatus | 'all') => void
  className?: string
}

export function StatusFilterChips({
  value,
  onChange,
  className,
}: StatusFilterChipsProps) {
  const currentStatus = value

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter by status"
    >
      {STATUS_CHIPS.map((chip) => {
        const isActive = currentStatus === chip.value
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange(chip.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              'hover:scale-[1.02] active:scale-[0.98]',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
            aria-pressed={isActive}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
