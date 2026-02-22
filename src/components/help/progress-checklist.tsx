import { CheckCircle2, Circle, Plus, Settings, Share2, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon: string
}

interface ProgressChecklistProps {
  steps: ProgressStep[]
  className?: string
}

const iconMap: Record<string, React.ReactNode> = {
  create: <Plus className="h-5 w-5" />,
  configure: <Settings className="h-5 w-5" />,
  publish: <Rocket className="h-5 w-5" />,
  share: <Share2 className="h-5 w-5" />,
}

export function ProgressChecklist({ steps, className }: ProgressChecklistProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex gap-4 rounded-lg border border-border p-4 transition-all duration-200',
            step.completed ? 'bg-accent/30 border-accent/50' : 'bg-card hover:shadow-card'
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              step.completed ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              iconMap[step.icon] ?? <Circle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold', step.completed && 'text-muted-foreground line-through')}>
              {index + 1}. {step.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
