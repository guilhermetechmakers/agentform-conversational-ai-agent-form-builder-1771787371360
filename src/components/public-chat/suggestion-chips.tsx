import { cn } from '@/lib/utils'

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (text: string) => void
  disabled?: boolean
  className?: string
}

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
  className,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 max-w-3xl mx-auto px-4 pb-2',
        className
      )}
    >
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          disabled={disabled}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
            'bg-[#E6F4FF] text-foreground',
            'hover:bg-[#E6F4FF]/90 hover:scale-[1.02] active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
