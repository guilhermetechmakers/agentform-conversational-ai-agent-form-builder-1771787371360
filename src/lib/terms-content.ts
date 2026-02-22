/**
 * Terms of Service content configuration.
 * Centralized for easy updates and API fallback.
 */

import type { PolicySectionData } from '@/lib/privacy-content'

export type TermsSectionData = PolicySectionData

export const TERMS_OF_SERVICE_SECTIONS: PolicySectionData[] = [
  {
    id: 'account',
    title: 'Account',
    content:
      'By creating an account with AgentForm, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security. We reserve the right to suspend or terminate accounts that violate these terms or that we determine pose a risk to our platform or other users.',
    subsections: [
      {
        title: 'Account Eligibility',
        content:
          'You must be at least 18 years old and have the legal capacity to enter into binding contracts to use AgentForm. By using our services, you represent and warrant that you meet these requirements.',
      },
      {
        title: 'Account Security',
        content:
          'You are solely responsible for all activity under your account. We recommend using strong, unique passwords and enabling two-factor authentication when available.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    content:
      'Paid plans are billed via Stripe. Subscription fees are charged in advance on a monthly or annual basis, depending on your selected plan. Usage over your plan quota may incur additional charges as specified in your plan details.',
    subsections: [
      {
        title: 'Billing Cycle',
        content:
          'Billing occurs at the start of each billing period. You will be charged automatically using the payment method on file unless you cancel before the renewal date.',
      },
      {
        title: 'Refunds',
        content:
          'Refunds are handled in accordance with our refund policy. Generally, we offer prorated refunds for annual plans cancelled within 30 days of purchase. Monthly plans are non-refundable after the billing period has started.',
      },
      {
        title: 'Price Changes',
        content:
          'We may change our pricing with 30 days notice. Continued use of paid services after a price increase constitutes acceptance of the new terms.',
      },
    ],
  },
  {
    id: 'prohibited-content',
    title: 'Prohibited Content',
    content:
      'You may not use AgentForm for illegal, harmful, abusive, or otherwise prohibited purposes. We reserve the right to suspend or terminate accounts that violate these terms, with or without notice.',
    subsections: [
      {
        title: 'Prohibited Uses',
        content:
          'You may not use AgentForm to: distribute malware or harmful code; engage in phishing or fraud; collect personal data without consent; harass, abuse, or harm others; violate applicable laws or regulations; or infringe on intellectual property rights.',
      },
      {
        title: 'Content Restrictions',
        content:
          'You may not create agents that promote violence, hate speech, illegal activities, or content that exploits minors. We may remove content and suspend accounts at our discretion.',
      },
      {
        title: 'Enforcement',
        content:
          'We actively monitor for violations and may take action including content removal, account suspension, or termination. We may report illegal activity to law enforcement.',
      },
    ],
  },
  {
    id: 'liability',
    title: 'Liability',
    content:
      'To the maximum extent permitted by law, AgentForm and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill. Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us in the twelve months preceding the claim.',
    subsections: [
      {
        title: 'Service Availability',
        content:
          'We strive for high availability but do not guarantee uninterrupted access. We are not liable for downtime, data loss, or service interruptions beyond our control.',
      },
      {
        title: 'Third-Party Services',
        content:
          'Our platform may integrate with third-party services. We are not responsible for the availability, accuracy, or practices of third-party services. Your use of webhooks and integrations is at your own risk.',
      },
      {
        title: 'Disclaimer',
        content:
          'AgentForm is provided "as is" without warranties of any kind. We disclaim all implied warranties including merchantability, fitness for a particular purpose, and non-infringement.',
      },
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    content:
      'You may terminate your account at any time through your account settings. We may suspend or terminate your account immediately for violations of these terms, non-payment, or at our discretion for any reason. Upon termination, your right to use the service ceases immediately.',
    subsections: [
      {
        title: 'Effect of Termination',
        content:
          'Upon termination, we may retain your data for a reasonable period as required by law or for legitimate business purposes. You may request data export before termination.',
      },
      {
        title: 'Survival',
        content:
          'Sections of these terms that by their nature should survive termination (including liability, indemnification, and dispute resolution) shall survive.',
      },
    ],
  },
]

export const TERMS_EFFECTIVE_DATE = 'February 22, 2025'
export const TERMS_VERSION = '1.0.0'

/** Alias for use-terms hook compatibility */
export const TERMS_SECTIONS = TERMS_OF_SERVICE_SECTIONS
