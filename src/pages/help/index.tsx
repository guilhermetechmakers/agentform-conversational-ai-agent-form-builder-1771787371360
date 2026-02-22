import { Link, Outlet } from 'react-router-dom'
import { Bot, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export function HelpPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">AgentForm</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="ghost">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
