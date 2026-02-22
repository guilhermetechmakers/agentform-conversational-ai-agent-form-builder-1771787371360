import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { SettingsSidebar } from '@/components/settings'
import { getSettingsSidebarState, setSettingsSidebarState } from '@/lib/settings-sidebar-state'
import { cn } from '@/lib/utils'

export function SettingsLayout() {
  const [collapsed, setCollapsed] = useState(getSettingsSidebarState)

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      setSettingsSidebarState(next)
      return next
    })
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, team, billing, API keys, security, and data privacy
        </p>
      </div>

      <div className="flex gap-6">
        <SettingsSidebar collapsed={collapsed} onToggle={handleToggle} />
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
