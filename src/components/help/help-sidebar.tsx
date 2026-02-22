import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  Rocket,
  HelpCircle,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const SIDEBAR_KEY = 'agentform-help-sidebar-collapsed'

const navItems = [
  { to: '/help/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/help/getting-started', icon: Rocket, label: 'Getting Started' },
  { to: '/help/faqs', icon: HelpCircle, label: 'FAQs' },
  { to: '/help/contact', icon: Mail, label: 'Contact Support' },
  { to: '/help/changelog', icon: FileText, label: 'Changelog & Status' },
]

interface HelpSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function HelpSidebar({ collapsed, onToggle }: HelpSidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-[72px]' : 'w-56'
      )}
    >
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3" aria-label="Help navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/20 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )
                }
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

export function getHelpSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export function setHelpSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  } catch {
    // ignore
  }
}
