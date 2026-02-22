import { apiGet, apiPost } from '@/lib/api'
import type { Feature, PricingTier, Testimonial, VisitorLogPayload } from '@/types/landing'

export async function getFeatures(): Promise<Feature[]> {
  try {
    return await apiGet<Feature[]>('/features')
  } catch {
    return getFallbackFeatures()
  }
}

export async function getPricing(): Promise<PricingTier[]> {
  try {
    return await apiGet<PricingTier[]>('/pricing')
  } catch {
    return getFallbackPricing()
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    return await apiGet<Testimonial[]>('/testimonials')
  } catch {
    return getFallbackTestimonials()
  }
}

export async function logVisitor(payload: VisitorLogPayload): Promise<void> {
  try {
    await apiPost('/visitor-log', payload)
  } catch {
    // Non-critical; fail silently
  }
}

function getFallbackFeatures(): Feature[] {
  return [
    {
      id: '1',
      name: 'Agent Builder',
      description:
        'Build AI agents that collect structured data through natural chat. Define fields, personas, and validation rules—no code required.',
      iconPath: undefined,
    },
    {
      id: '2',
      name: 'Conversational Links',
      description:
        'Share agents via unique public URLs. No embedding required. Perfect for campaigns, lead capture, and customer surveys.',
      iconPath: undefined,
    },
    {
      id: '3',
      name: 'Webhooks',
      description:
        'Send extracted data to your CRM, Airtable, or custom endpoints. Real-time delivery with retry logic.',
      iconPath: undefined,
    },
    {
      id: '4',
      name: 'Analytics',
      description:
        'Full transcripts, session metrics, and conversion tracking. Export data or integrate with your analytics stack.',
      iconPath: undefined,
    },
  ]
}

function getFallbackPricing(): PricingTier[] {
  return [
    {
      id: '1',
      name: 'Starter',
      price: 0,
      featuresIncluded: ['1 agent', '100 sessions/month', 'Public links'],
    },
    {
      id: '2',
      name: 'Pro',
      price: 49,
      featuresIncluded: ['5 agents', '2,000 sessions/month', 'Webhooks', 'Custom branding'],
    },
    {
      id: '3',
      name: 'Team',
      price: 149,
      featuresIncluded: ['Unlimited agents', '10,000 sessions/month', 'SSO', 'Priority support'],
    },
  ]
}

function getFallbackTestimonials(): Testimonial[] {
  return [
    {
      id: '1',
      customerName: 'Sarah Chen',
      quote:
        'AgentForm cut our form abandonment in half. The conversational flow feels natural and we capture way more context than traditional forms.',
      logoPath: undefined,
    },
    {
      id: '2',
      customerName: 'Marcus Johnson',
      quote:
        'We integrated AgentForm with our CRM in a day. The webhooks are reliable and the data structure is exactly what we need.',
      logoPath: undefined,
    },
    {
      id: '3',
      customerName: 'Elena Rodriguez',
      quote:
        'Our sales team loves the public links. We drop them in outreach and get qualified leads without any friction.',
      logoPath: undefined,
    },
  ]
}
