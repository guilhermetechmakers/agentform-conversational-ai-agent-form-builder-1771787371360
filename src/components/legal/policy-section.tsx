import { cn } from '@/lib/utils'
import type { PolicySectionData } from '@/lib/privacy-content'

interface PolicySectionProps {
  section: PolicySectionData
  className?: string
}

export function PolicySection({ section, className }: PolicySectionProps) {
  return (
    <section
      id={section.id}
      className={cn('animate-fade-in-up', className)}
      aria-labelledby={`${section.id}-heading`}
    >
      <h2
        id={`${section.id}-heading`}
        className="text-xl font-bold text-[#191A1D] mb-4"
      >
        {section.title}
      </h2>
      {section.content && (
        <p className="text-base font-normal text-[#191A1D] leading-relaxed mb-4">
          {section.content}
        </p>
      )}
      {section.subsections?.map((sub) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sub.content.trim())
        return (
          <div key={sub.title} className="mb-4">
            <h3 className="text-base font-medium text-[#191A1D] mb-2">
              {sub.title}
            </h3>
            {isEmail ? (
              <a
                href={`mailto:${sub.content.trim()}`}
                className="text-base font-normal text-[#191A1D] leading-relaxed underline decoration-[#FFE066] underline-offset-2 hover:text-[#FFE066] transition-colors"
              >
                {sub.content}
              </a>
            ) : (
              <p className="text-base font-normal text-[#191A1D] leading-relaxed">
                {sub.content}
              </p>
            )}
          </div>
        )
      })}
    </section>
  )
}
