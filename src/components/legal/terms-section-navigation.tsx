import { cn } from '@/lib/utils'
import type { TermsSectionData } from '@/lib/terms-content'

interface TermsSectionNavigationProps {
  sections: TermsSectionData[]
  activeSectionId: string | null
  className?: string
}

export function TermsSectionNavigation({
  sections,
  activeSectionId,
  className,
}: TermsSectionNavigationProps) {
  const handleMobileNavChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Mobile: compact select */}
      <div className="lg:hidden mb-6">
        <label htmlFor="terms-nav-mobile" className="sr-only">
          Jump to section
        </label>
        <select
          id="terms-nav-mobile"
          value={activeSectionId ?? ''}
          onChange={handleMobileNavChange}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Jump to section"
        >
          <option value="">Select section...</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
              {s.isNew ? ' (New)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: sticky sidebar */}
      <nav
        className={cn(
          'sticky top-24 shrink-0 w-48 space-y-1',
          'hidden lg:block',
          className
        )}
        aria-label="Terms of Service sections"
      >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'block py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary/10 text-foreground border-l-2 border-primary -ml-[2px] pl-[14px]'
                    : 'text-muted-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  {section.title}
                  {section.isNew && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/20 px-1.5 py-0.5 rounded">
                      New
                    </span>
                  )}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
    </>
  )
}
