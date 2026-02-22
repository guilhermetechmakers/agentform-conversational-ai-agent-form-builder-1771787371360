import { NavLink, useLocation } from 'react-router-dom'
import {
  User,
  Users,
  CreditCard,
  Bell,
  Key,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const SIDEBAR_KEY = 'agentform-settings-sidebar-collapsed'

const navItems = [
  { to: '/dashboard/settings/profile', icon: User, label: 'Account Profile' },
  { to: '/dashboard/settings/team', icon: Users, label: 'Team Management' },
  { to: '/dashboard/settings/billing', icon: CreditCard, label: 'Billing & Plans' },
  { to: '/dashboard/settings/notifications', icon: Bell, label: 'Email & Notifications' },
  { to: '/dashboard/settings/api-webhooks', icon: Key, label: 'API & Webhooks' },
  { to: '/dashboard/settings/security', icon: Shield, label: 'Security' },
  { to: '/dashboard/settings/data-privacy', icon: Database, label: 'Data & Privacy' },
]

interface SettingsSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function SettingsSidebar({ collapsed, onToggle }: SettingsSidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-56'
      )}
    >
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3" aria-label="Settings navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.to ||
              location.pathname.startsWith(item.to + '/')
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full', collapsed && 'justify-center')}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

export function getSettingsSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export function setSettingsSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  } catch {
    // ignore
  }
}
