import { Link } from 'react-router-dom'
import { Bot, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/help', label: 'Help' },
]

interface PublicNavbarProps {
  className?: string
  /** When true, uses compact styling (e.g. for auth pages) */
  compact?: boolean
}

export function PublicNavbar({ className, compact }: PublicNavbarProps) {
  const { isAuthenticated } = useAuth()

  return (
    <nav
      className={cn(
        'flex items-center justify-between',
        compact ? 'px-4 py-4' : 'px-6 py-6 md:px-8 max-w-7xl mx-auto',
        className
      )}
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-[#191A1D] hover:opacity-80 transition-opacity"
        aria-label="AgentForm home"
      >
        <div className="h-10 w-10 rounded-xl bg-[#FFE066] flex items-center justify-center shrink-0">
          <Bot className="h-6 w-6 text-[#191A1D]" />
        </div>
        <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
      </Link>
      <div className="flex items-center gap-4">
        {PUBLIC_NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'text-sm font-medium text-[#687076] hover:text-[#191A1D] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded'
            )}
          >
            {label}
          </Link>
        ))}
        {isAuthenticated ? (
          <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
            <Link to="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="cta-primary shrink-0"
                aria-label="Create your first agent"
              >
                Create Agent
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
