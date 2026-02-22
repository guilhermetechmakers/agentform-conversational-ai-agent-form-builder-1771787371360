import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Check, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getPricing } from '@/api/landing'
import type { PricingTier } from '@/types/landing'
import { cn } from '@/lib/utils'

export function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getPricing()
      .then(setTiers)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[#EDEDED] bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="AgentForm home">
            <div className="h-10 w-10 rounded-xl bg-[#FFE066] flex items-center justify-center">
              <Bot className="h-6 w-6 text-[#191A1D]" />
            </div>
            <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#191A1D] mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-[#687076] text-center max-w-2xl mx-auto mb-16 font-normal">
          Start free. Scale as you grow. No hidden fees.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl border-[#EDEDED] animate-pulse">
                <CardContent className="p-8">
                  <div className="h-6 w-24 bg-muted rounded" />
                  <div className="mt-6 h-10 w-20 bg-muted rounded" />
                  <div className="mt-8 space-y-3">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-4/5 bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <Card
                key={tier.id}
                className={cn(
                  'rounded-xl border-[#EDEDED] shadow-md transition-all duration-300',
                  'hover:scale-[1.02] hover:shadow-card-hover',
                  i === 1 && 'ring-2 ring-[#FFE066]'
                )}
              >
                <CardContent className="p-8">
                  <h2 className="text-xl font-medium text-[#191A1D]">{tier.name}</h2>
                  <p className="mt-6 text-3xl font-bold text-[#191A1D]">
                    {typeof tier.price === 'number'
                      ? tier.price === 0
                        ? 'Free'
                        : `$${tier.price}/mo`
                      : tier.price}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {tier.featuresIncluded.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[#687076]">
                        <Check className="h-5 w-5 text-[#FFE066] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      asChild
                      variant={i === 1 ? undefined : 'outline'}
                      className={cn('w-full', i === 1 && 'cta-primary')}
                    >
                      <Link to="/login">
                        {tier.name === 'Starter' || tier.price === 0
                          ? 'Get started free'
                          : 'Start trial'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link to="/">
            <Button variant="ghost" className="text-[#687076] hover:text-[#191A1D]">
              ← Back to home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
