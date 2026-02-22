import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '@/components/navigation'

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <PublicNavbar className="max-w-7xl mx-auto" />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
