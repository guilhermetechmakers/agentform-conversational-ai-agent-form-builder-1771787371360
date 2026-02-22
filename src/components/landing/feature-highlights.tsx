import { Link2, Bot, Webhook, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Feature } from '@/types/landing'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Agent Builder': Bot,
  'Conversational Links': Link2,
  Webhooks: Webhook,
  Analytics: BarChart3,
}

export interface FeatureHighlightsProps {
  features: Feature[]
  isLoading?: boolean
}

export function FeatureHighlights({ features, isLoading }: FeatureHighlightsProps) {
  if (isLoading) {
    return (
      <section className="px-6 py-20 md:py-32 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <Card key={idx} className="rounded-xl border-[#EDEDED] shadow-md animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                <div className="mt-4 h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-4 w-full bg-muted rounded animate-pulse" />
                <div className="mt-2 h-4 w-5/6 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 py-20 md:py-32 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#191A1D] mb-4">
        Built for modern teams
      </h2>
      <p className="text-[#687076] text-center max-w-2xl mx-auto mb-16 font-normal">
        Reduce lead-capture friction. Capture richer context. Deploy in minutes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = ICON_MAP[feature.name] ?? BarChart3
          return (
            <Card
              key={feature.id}
              className={cn(
                'rounded-xl border-[#EDEDED] shadow-md transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-card-hover hover:border-[#EDEDED]'
              )}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-[#FFE066]/20 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[#FFE066]" />
                </div>
                <h3 className="text-xl font-medium text-[#191A1D] mb-2">
                  {feature.name}
                </h3>
                <p className="text-[#687076] font-normal">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
