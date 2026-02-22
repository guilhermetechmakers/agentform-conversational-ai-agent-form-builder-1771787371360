import { cn } from '@/lib/utils'
import type { PolicySectionData } from '@/lib/privacy-content'

interface SectionNavigationProps {
  sections: PolicySectionData[]
  activeSectionId: string | null
  onNavigate: (sectionId: string) => void
  className?: string
}

export function SectionNavigation({
  sections,
  activeSectionId,
  onNavigate,
  className,
}: SectionNavigationProps) {
  return (
    <nav
      className={cn(
        'sticky top-24 flex flex-col gap-1',
        'rounded-xl border border-border bg-card p-4 shadow-card',
        'transition-all duration-300',
        className
      )}
      aria-label="Terms of Service sections"
    >
      <h3 className="text-sm font-semibold text-foreground mb-2 px-2">
        On this page
      </h3>
      <ul className="space-y-0.5">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onNavigate(section.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium',
                  'transition-all duration-200',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary/20 text-foreground border-l-2 border-primary pl-2'
                    : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.title}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
