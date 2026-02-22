import { useEffect, useState, useCallback } from 'react'
import {
  HeroSection,
  FeatureHighlights,
  PricingTeaser,
  Testimonials,
  Footer,
} from '@/components/landing'
import { getFeatures, getPricing, getTestimonials, logVisitor } from '@/api/landing'
import type { Feature, PricingTier, Testimonial } from '@/types/landing'

export function LandingPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [pricing, setPricing] = useState<PricingTier[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleVisitorLog = useCallback(() => {
    logVisitor({ source: 'landing', landingPageId: 'home' })
  }, [])

  useEffect(() => {
    Promise.all([getFeatures(), getPricing(), getTestimonials()])
      .then(([f, p, t]) => {
        setFeatures(f)
        setPricing(p)
        setTestimonials(t)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onVisitorLog={handleVisitorLog} />
      <FeatureHighlights features={features} isLoading={isLoading} />
      <PricingTeaser tiers={pricing} isLoading={isLoading} />
      <Testimonials testimonials={testimonials} isLoading={isLoading} />
      <Footer />
    </div>
  )
}
