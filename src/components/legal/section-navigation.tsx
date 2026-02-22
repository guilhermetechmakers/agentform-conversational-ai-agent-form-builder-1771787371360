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
    <>
      {/* Mobile: compact select for quick section jump */}
      <div className="lg:hidden mb-6">
        <label htmlFor="terms-section-nav" className="sr-only">
          Jump to section
        </label>
        <select
          id="terms-section-nav"
          value={activeSectionId ?? ''}
          onChange={(e) => {
            const id = e.target.value
            if (id) onNavigate(id)
          }}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Jump to section"
        >
          <option value="">Select section...</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
              {'isNew' in s && s.isNew ? ' (New)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: sticky sidebar */}
      <nav
        className={cn(
          'hidden lg:flex sticky top-24 flex-col gap-1',
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
    </>
  )
}
