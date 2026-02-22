import { useState, useCallback } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Bot,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AdminSearchBar } from '@/components/search/admin-search-bar'

const SIDEBAR_KEY = 'agentform-admin-sidebar-collapsed'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/agents', icon: Bot, label: 'Agents' },
  { to: '/admin/logs', icon: FileText, label: 'Logs' },
  { to: '/admin/security-compliance', icon: Shield, label: 'Security & Compliance' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/sso', icon: KeyRound, label: 'SSO Settings' },
]

function getSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

function setSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  } catch {
    // ignore
  }
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(getSidebarState)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      setSidebarState(next)
      return next
    })
  }, [])

  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-[#FFFFFF] border-r border-[#EDEDED] transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center border-b border-[#EDEDED] px-4">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-[#191A1D]">Admin</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/admin" className="mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </Link>
          )}
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3" aria-label="Admin navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                (item.to === '/admin' && location.pathname === '/admin') ||
                (item.to !== '/admin' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/20 text-[#191A1D]'
                      : 'text-[#687076] hover:bg-[#F7F8FA] hover:text-[#191A1D]',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-[#EDEDED] p-3">
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn('w-full', collapsed && 'justify-center')}
            onClick={toggle}
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

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#FFFFFF] border-r border-[#EDEDED] transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#EDEDED] px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-[#191A1D]">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                (item.to === '/admin' && location.pathname === '/admin') ||
                (item.to !== '/admin' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-[#191A1D]'
                      : 'text-[#687076] hover:bg-[#F7F8FA] hover:text-[#191A1D]'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#EDEDED] bg-[#FFFFFF] px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <h1 className="text-lg font-semibold text-[#191A1D] shrink-0">Admin Dashboard</h1>
              <AdminSearchBar className="max-w-sm flex-1" />
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to="/dashboard">Back to App</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
