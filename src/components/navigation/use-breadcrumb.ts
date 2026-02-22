import { useLocation, useParams } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href?: string
}

/** Route path to breadcrumb label mapping for dashboard */
const DASHBOARD_ROUTES: Record<string, string> = {
  overview: 'Overview',
  agents: 'Agents',
  new: 'Create Agent',
  analytics: 'Analytics',
  sessions: 'Sessions',
  operations: 'Operations',
  settings: 'Settings',
  profile: 'Account Profile',
  team: 'Team Management',
  billing: 'Billing & Plans',
  notifications: 'Email & Notifications',
  'api-webhooks': 'API & Webhooks',
  security: 'Security',
  'data-privacy': 'Data & Privacy',
}

/** Route path to breadcrumb label mapping for admin */
const ADMIN_ROUTES: Record<string, string> = {
  users: 'Users',
  agents: 'Agents',
  logs: 'Logs',
  billing: 'Billing',
  sso: 'SSO Settings',
  'security-compliance': 'Security & Compliance',
}

/** Route path to breadcrumb label mapping for help */
const HELP_ROUTES: Record<string, string> = {
  'knowledge-base': 'Knowledge Base',
  'getting-started': 'Getting Started',
  faqs: 'FAQs',
  contact: 'Contact Support',
  changelog: 'Changelog & Status',
}

function getLabel(segment: string, routes: Record<string, string>): string {
  return routes[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Generates breadcrumb items from the current route.
 * Use when you need dynamic breadcrumbs based on URL.
 */
export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation()
  const params = useParams()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return []

  if (pathname.startsWith('/dashboard')) {
    const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }]
    const rest = segments.slice(1)
    for (let i = 0; i < rest.length; i++) {
      const seg = rest[i]
      const label = DASHBOARD_ROUTES[seg] ?? (params.id ? `Item ${params.id.slice(0, 8)}…` : getLabel(seg, DASHBOARD_ROUTES))
      const isLast = i === rest.length - 1
      const href = isLast ? undefined : `/dashboard/${rest.slice(0, i + 1).join('/')}`
      items.push({ label, href })
    }
    return items
  }

  if (pathname.startsWith('/admin')) {
    const items: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin' }]
    const rest = segments.slice(1)
    for (let i = 0; i < rest.length; i++) {
      const seg = rest[i]
      const label = ADMIN_ROUTES[seg] ?? getLabel(seg, ADMIN_ROUTES)
      const isLast = i === rest.length - 1
      const href = isLast ? undefined : `/admin/${rest.slice(0, i + 1).join('/')}`
      items.push({ label, href })
    }
    return items
  }

  if (pathname.startsWith('/help')) {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Help', href: '/help' },
    ]
    const rest = segments.slice(1)
    for (let i = 0; i < rest.length; i++) {
      const seg = rest[i]
      const label = HELP_ROUTES[seg] ?? getLabel(seg, HELP_ROUTES)
      const isLast = i === rest.length - 1
      const href = isLast ? undefined : `/help/${rest.slice(0, i + 1).join('/')}`
      items.push({ label, href })
    }
    return items
  }

  return []
}
