import { useLocation, useParams } from 'react-router-dom'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

/** Path segment to human-readable label mapping */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  agents: 'Agents',
  sessions: 'Sessions',
  settings: 'Settings',
  operations: 'Operations',
  admin: 'Admin',
  help: 'Help',
  profile: 'Profile',
  team: 'Team',
  billing: 'Billing',
  notifications: 'Notifications',
  'api-webhooks': 'API & Webhooks',
  security: 'Security',
  'data-privacy': 'Data & Privacy',
  'knowledge-base': 'Knowledge Base',
  'getting-started': 'Getting Started',
  faqs: 'FAQs',
  contact: 'Contact Support',
  changelog: 'Changelog',
  users: 'Users',
  logs: 'Logs',
  'security-compliance': 'Security & Compliance',
  sso: 'SSO Settings',
  new: 'New Agent',
}

function segmentToLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Generates breadcrumb items from the current route path.
 * Supports dynamic segments (e.g. :id) when a custom label is provided.
 */
export function useRouteBreadcrumbs(customLabels?: Record<string, string>): BreadcrumbItem[] {
  const location = useLocation()
  const params = useParams()
  const pathnames = location.pathname.split('/').filter(Boolean)

  if (pathnames.length === 0) return []

  const items: BreadcrumbItem[] = []
  let href = ''

  for (let i = 0; i < pathnames.length; i++) {
    const segment = pathnames[i]
    href += `/${segment}`

    let label: string
    if (customLabels && customLabels[segment]) {
      label = customLabels[segment]
    } else if (params.id && segment === params.id) {
      label = customLabels?.id ?? `Item ${segment.slice(0, 8)}…`
    } else {
      label = segmentToLabel(segment)
    }

    const isLast = i === pathnames.length - 1
    items.push({
      label,
      href: isLast ? undefined : href,
    })
  }

  return items
}
