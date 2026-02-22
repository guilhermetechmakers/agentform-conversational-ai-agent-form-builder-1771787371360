import { ProgressChecklist, type ProgressStep } from './progress-checklist'

const DEFAULT_STEPS: ProgressStep[] = [
  {
    id: '1',
    title: 'Create your first agent',
    description: 'Go to Dashboard → Create Agent. Define the fields you need for your form.',
    completed: false,
    icon: 'create',
  },
  {
    id: '2',
    title: 'Configure persona and tone',
    description: 'Set instructions and tone so the AI knows how to behave.',
    completed: false,
    icon: 'configure',
  },
  {
    id: '3',
    title: 'Publish and get your link',
    description: 'Publish your agent to receive a public chat link.',
    completed: false,
    icon: 'publish',
  },
  {
    id: '4',
    title: 'Share with users',
    description: 'Embed the link or share it directly with your audience.',
    completed: false,
    icon: 'share',
  },
]

const STORAGE_KEY = 'agentform_help_getting_started'

function getStoredProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, boolean>
      return typeof parsed === 'object' ? parsed : {}
    }
  } catch {
    // ignore
  }
  return {}
}

export function GettingStartedGuide() {
  const progress = getStoredProgress()
  const steps: ProgressStep[] = DEFAULT_STEPS.map((s) => ({
    ...s,
    completed: progress[s.id] ?? s.completed,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
        <p className="text-muted-foreground text-sm">
          Follow these steps to get your first agent up and running.
        </p>
      </div>

      <ProgressChecklist steps={steps} />
    </div>
  )
}
