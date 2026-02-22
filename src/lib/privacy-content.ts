/**
 * Privacy Policy content configuration.
 * Centralized for easy updates and PDF generation.
 */

export interface PolicySubSection {
  title: string
  content: string
}

export interface PolicySectionData {
  id: string
  title: string
  subsections?: PolicySubSection[]
  content?: string
}

export const PRIVACY_POLICY_SECTIONS: PolicySectionData[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content:
      'AgentForm ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, retain, and protect your information when you use our conversational AI agent form builder and related services. By using AgentForm, you agree to the practices described in this policy.',
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    subsections: [
      {
        title: 'Account Information',
        content:
          'When you create an account, we collect your email address, name, and password. We may also collect profile information you choose to provide.',
      },
      {
        title: 'Usage Data',
        content:
          'We collect information about how you use our services, including agent configurations, session metadata, form submissions, and interaction patterns.',
      },
      {
        title: 'Conversation Data',
        content:
          'When users interact with your agents, we collect conversation transcripts, extracted form fields, and related metadata necessary to provide and improve our services.',
      },
      {
        title: 'Technical Data',
        content:
          'We automatically collect device information, IP addresses, browser type, and log data to ensure security and improve our platform.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    subsections: [
      {
        title: 'Service Delivery',
        content:
          'We use your data to operate, maintain, and improve AgentForm, including processing form submissions, powering AI conversations, and delivering webhook payloads.',
      },
      {
        title: 'Communication',
        content:
          'We may use your contact information to send transactional emails, product updates, and respond to support requests.',
      },
      {
        title: 'Analytics and Improvement',
        content:
          'We analyze aggregated, anonymized data to understand usage patterns, improve our AI models, and develop new features.',
      },
      {
        title: 'Security and Compliance',
        content:
          'We use your information to detect fraud, enforce our terms, and comply with legal obligations.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    content:
      'Data retention is configurable per account. By default, session and conversation data is retained for 90 days. You can adjust retention settings in your account. We retain account information for as long as your account is active and for a reasonable period thereafter to comply with legal obligations and resolve disputes. You may request export or deletion of your data at any time.',
  },
  {
    id: 'user-rights',
    title: 'User Rights and Choices',
    subsections: [
      {
        title: 'Access and Portability',
        content:
          'You have the right to access your personal data and receive a copy in a portable format. Use the data export feature in Settings or contact us.',
      },
      {
        title: 'Correction',
        content:
          'You can update your account information at any time through your profile settings.',
      },
      {
        title: 'Deletion',
        content:
          'You may request deletion of your personal data. We will process deletion requests in accordance with applicable law and our retention policies.',
      },
      {
        title: 'Opt-Out',
        content:
          'You can opt out of marketing communications at any time. Transactional emails related to your account cannot be opted out.',
      },
    ],
  },
  {
    id: 'third-party-sharing',
    title: 'Third-party Sharing',
    subsections: [
      {
        title: 'Service Providers',
        content:
          'We share data with trusted service providers who assist in operating our platform, including Stripe for billing, SendGrid or AWS SES for email delivery, and AWS for storage and infrastructure.',
      },
      {
        title: 'Webhooks',
        content:
          'When you configure webhooks, form data and session payloads are sent to the URLs you specify. You are responsible for the privacy practices of those endpoints.',
      },
      {
        title: 'Legal Requirements',
        content:
          'We may disclose information when required by law, to protect our rights, or to ensure the safety of our users.',
      },
    ],
  },
  {
    id: 'security-measures',
    title: 'Security Measures',
    content:
      'We implement industry-standard security measures including encryption in transit (TLS) and at rest (AES-256), access controls, and regular security assessments. We use Row-Level Security (RLS) policies to ensure data isolation between accounts. All communications, including PDF downloads, occur over HTTPS. We do not store payment card details; billing is handled by Stripe. We continuously monitor for threats and respond to security incidents promptly. While we strive to protect your information, no method of transmission over the internet is 100% secure.',
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content:
      'For privacy inquiries, data subject requests, or to contact our Data Protection Officer, please reach out to us. We aim to respond to all requests within 30 days.',
    subsections: [
      {
        title: 'Privacy & Data Protection',
        content: 'privacy@agentform.app',
      },
      {
        title: 'General Support',
        content: 'support@agentform.app',
      },
    ],
  },
]

export const PRIVACY_POLICY_LAST_UPDATED = 'February 2025'
