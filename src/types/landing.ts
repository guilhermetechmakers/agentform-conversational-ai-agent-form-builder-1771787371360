export interface Feature {
  id: string
  name: string
  description: string
  iconPath?: string
}

export interface PricingTier {
  id: string
  name: string
  price: number | string
  featuresIncluded: string[]
}

export interface Testimonial {
  id: string
  customerName: string
  quote: string
  logoPath?: string
}

export interface VisitorLogPayload {
  source?: string
  landingPageId?: string
}
