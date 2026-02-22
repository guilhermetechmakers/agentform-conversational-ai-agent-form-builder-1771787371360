import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicAgentField } from '@/types/public-chat'
import type { CollectedField } from '@/types/public-chat'

interface ProgressSummaryProps {
  fields: PublicAgentField[]
  collected: CollectedField[]
  className?: string
}

export function ProgressSummary({
  fields,
  collected,
  className,
}: ProgressSummaryProps) {
  const collectedIds = new Set(collected.map((c) => c.fieldId))
  const requiredCount = fields.filter((f) => f.required).length
  const completedCount = collected.filter((c) =>
    fields.some((f) => (f.id ?? '') === c.fieldId && f.required)
  ).length

  if (fields.length === 0) return null

  return (
    <div
      className={cn(
        'sticky top-[73px] z-[9] border-b border-border bg-card/95 backdrop-blur px-4 py-2',
        className
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center text-xs text-[#687076] mb-2">
          <span>Progress</span>
          <span>
            {completedCount} / {requiredCount} required
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {[...fields]
            .filter((f) => f.required)
            .sort((a, b) => a.order - b.order)
            .map((f) => {
              const id = f.id ?? ''
              const done = collectedIds.has(id)
              return (
                <li
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                    done
                      ? 'bg-[#D5F5E3] text-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-current shrink-0" />
                  )}
                  {f.label}
                </li>
              )
            })}
        </ul>
      </div>
    </div>
  )
}
