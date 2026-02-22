import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { HelpSidebar, getHelpSidebarState, setHelpSidebarState } from '@/components/help'
import { cn } from '@/lib/utils'

export function HelpLayout() {
  const [collapsed, setCollapsed] = useState(getHelpSidebarState)

  const handleToggle = useCallback(() => {
    setCollapsed((prev: boolean) => {
      const next = !prev
      setHelpSidebarState(next)
      return next
    })
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-1">
          Find answers, get started, and reach our support team
        </p>
      </div>

      <div className="flex gap-6">
        <HelpSidebar collapsed={collapsed} onToggle={handleToggle} />
        <main
          className={cn(
            'flex-1 min-w-0 transition-all duration-300',
            collapsed ? 'max-w-full' : ''
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
