import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types/landing'

const CUSTOMER_LOGOS = [
  { name: 'Acme Corp', placeholder: 'AC' },
  { name: 'TechStart', placeholder: 'TS' },
  { name: 'GrowthCo', placeholder: 'GC' },
  { name: 'DataFlow', placeholder: 'DF' },
  { name: 'CloudNine', placeholder: 'C9' },
]

export interface TestimonialsProps {
  testimonials: Testimonial[]
  isLoading?: boolean
}

export function Testimonials({ testimonials, isLoading }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % Math.max(1, testimonials.length))
  }, [testimonials.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(
      (i) => (i - 1 + testimonials.length) % Math.max(1, testimonials.length)
    )
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length <= 1) return
    const id = setInterval(goNext, 5000)
    return () => clearInterval(id)
  }, [testimonials.length, goNext])

  if (isLoading) {
    return (
      <section className="px-6 py-20 md:py-32 md:px-8 border-t border-[#EDEDED]">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 w-64 bg-muted rounded mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 py-20 md:py-32 md:px-8 border-t border-[#EDEDED]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#191A1D] mb-4">
          Trusted by teams everywhere
        </h2>
        <p className="text-[#687076] text-center max-w-2xl mx-auto mb-12 font-normal">
          See what our customers say about AgentForm.
        </p>

        {/* Customer logos grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16 items-center justify-items-center">
          {CUSTOMER_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="h-12 w-32 flex items-center justify-center rounded-lg border border-[#EDEDED] bg-card text-muted-foreground text-sm font-medium"
              aria-label={`${logo.name} logo`}
            >
              {logo.placeholder}
            </div>
          ))}
        </div>

        {/* Testimonials carousel */}
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-[#687076]">
            <p>No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              role="region"
              aria-label="Customer testimonials carousel"
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="w-full flex-shrink-0 px-4 md:px-12"
                >
                  <div className="bg-card rounded-xl border border-[#EDEDED] p-8 md:p-12 shadow-md">
                    <Quote className="h-10 w-10 text-[#FFE066]/50 mb-4" />
                    <blockquote className="text-lg md:text-xl text-[#191A1D] font-normal leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <cite className="mt-6 block not-italic font-medium text-[#687076]">
                      — {t.customerName}
                    </cite>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={goPrev}
                  className="h-10 w-10 rounded-full border border-[#EDEDED] flex items-center justify-center text-[#687076] hover:text-[#191A1D] hover:border-[#FFE066] transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        'h-2 w-2 rounded-full transition-colors',
                        i === currentIndex
                          ? 'bg-[#FFE066]'
                          : 'bg-[#EDEDED] hover:bg-[#EDEDED]/80'
                      )}
                      aria-label={`Go to testimonial ${i + 1}`}
                      aria-current={i === currentIndex ? 'true' : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="h-10 w-10 rounded-full border border-[#EDEDED] flex items-center justify-center text-[#687076] hover:text-[#191A1D] hover:border-[#FFE066] transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
