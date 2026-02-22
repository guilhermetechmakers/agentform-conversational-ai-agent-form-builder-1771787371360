import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PricingTier } from '@/types/landing'

export interface PricingTeaserProps {
  tiers: PricingTier[]
  isLoading?: boolean
}

export function PricingTeaser({ tiers, isLoading }: PricingTeaserProps) {
  if (isLoading) {
    return (
      <section className="px-6 py-20 md:py-32 md:px-8 border-t border-[#EDEDED]">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 w-48 bg-muted rounded mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl border-[#EDEDED] animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 w-24 bg-muted rounded" />
                  <div className="mt-4 h-8 w-16 bg-muted rounded" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-4/5 bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 py-20 md:py-32 md:px-8 border-t border-[#EDEDED]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#191A1D] mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-[#687076] text-center max-w-2xl mx-auto mb-12 font-normal">
          Start free. Scale as you grow. No hidden fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'rounded-xl border-[#EDEDED] shadow-md transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-card-hover'
              )}
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-medium text-[#191A1D]">{tier.name}</h3>
                <p className="mt-4 text-2xl font-bold text-[#191A1D]">
                  {typeof tier.price === 'number'
                    ? tier.price === 0
                      ? 'Free'
                      : `$${tier.price}/mo`
                    : tier.price}
                </p>
                <ul className="mt-4 space-y-2">
                  {tier.featuresIncluded.map((f) => (
                    <li key={f} className="text-sm text-[#687076] flex items-center gap-2">
                      <span className="text-[#FFE066]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/pricing">
            <button
              type="button"
              className="cta-primary"
              aria-label="View full pricing"
            >
              View full pricing
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
