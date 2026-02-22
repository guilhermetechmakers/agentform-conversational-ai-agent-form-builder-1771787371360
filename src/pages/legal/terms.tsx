import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { PublicNavbar } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import {
  PolicySection,
  TermsSectionNavigation,
  AcknowledgementLink,
} from '@/components/legal'
import { Footer } from '@/components/landing'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchTerms } from '@/api/terms'
import {
  TERMS_OF_SERVICE_SECTIONS,
  TERMS_EFFECTIVE_DATE,
  TERMS_VERSION,
} from '@/lib/terms-content'
import type { PolicySectionData } from '@/lib/privacy-content'
import { cn } from '@/lib/utils'

function TermsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TermsFallbackBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="rounded-xl border border-muted-foreground/20 bg-muted/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in"
      role="status"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Showing cached terms. Latest version could not be loaded.
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 shrink-0">
        <RefreshCw className="h-4 w-4" aria-hidden />
        Retry
      </Button>
    </div>
  )
}

export function TermsOfServicePage() {
  const [sections, setSections] = useState<PolicySectionData[]>(
    TERMS_OF_SERVICE_SECTIONS
  )
  const [effectiveDate, setEffectiveDate] = useState(TERMS_EFFECTIVE_DATE)
  const [version, setVersion] = useState(TERMS_VERSION)
  const [termsId, setTermsId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  const loadTerms = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await fetchTerms()
      setEffectiveDate(data.effective_date)
      setVersion(data.version)
      if (data.sections && data.sections.length > 0) {
        setSections(
          data.sections.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            subsections: s.subsections,
            isNew: s.isNew,
          }))
        )
      }
      if ('id' in data && typeof (data as { id?: string }).id === 'string') {
        setTermsId((data as { id: string }).id)
      }
    } catch {
      setHasError(true)
      setSections(TERMS_OF_SERVICE_SECTIONS)
      setEffectiveDate(TERMS_EFFECTIVE_DATE)
      setVersion(TERMS_VERSION)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTerms()
  }, [loadTerms])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <PublicNavbar className="max-w-5xl mx-auto px-4 sm:px-6" />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="lg:w-56 shrink-0 order-1">
            {!isLoading && sections.length > 0 && (
              <TermsSectionNavigation
                sections={sections}
                activeSectionId={activeSectionId}
              />
            )}
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <TermsSkeleton />
            ) : (
              <>
                {hasError && (
                  <div className="mb-8">
                    <TermsFallbackBanner onRetry={loadTerms} />
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 animate-fade-in-up">
                  Terms of Service
                </h1>
                <p className="text-base font-medium text-muted-foreground mb-12 animate-fade-in-up">
                  Effective date: {effectiveDate}
                  {version && (
                    <span className="ml-2 text-sm">(v{version})</span>
                  )}
                </p>

                <div
                  className={cn(
                    'prose prose-sm max-w-none space-y-12 text-left',
                    'prose-headings:text-foreground prose-p:text-foreground/90'
                  )}
                >
                  {sections.map((section) => (
                    <PolicySection
                      key={section.id}
                      section={section}
                      className={cn(
                        'animate-fade-in-up scroll-mt-28',
                        section.isNew && 'rounded-2xl border-2 border-primary/30 bg-primary/5 p-6'
                      )}
                    />
                  ))}
                </div>

                <div className="mt-16">
                  <AcknowledgementLink termsId={termsId} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="pb-24">
        <Footer />
      </div>
    </div>
  )
}
