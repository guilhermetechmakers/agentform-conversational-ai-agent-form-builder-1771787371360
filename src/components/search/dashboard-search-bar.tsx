import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Search, Bot, MessageSquare, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAgents } from '@/hooks/use-agents'
import { useSessions } from '@/hooks/use-sessions'
import { debounce } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface DashboardSearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  isAgentsPage?: boolean
}

export function DashboardSearchBar({
  value: controlledValue,
  onChange: controlledOnChange,
  placeholder = 'Search agents, sessions...',
  isAgentsPage: isAgentsPageProp,
}: DashboardSearchBarProps = {}) {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [internalInput, setInternalInput] = useState('')
  const isControlled = controlledValue !== undefined
  const searchInput = isControlled ? (controlledValue ?? '') : internalInput
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const isAgentsPage = isAgentsPageProp ?? location.pathname === '/dashboard/agents'
  const isSessionsPage = location.pathname === '/dashboard/sessions'
  const urlSearch = isAgentsPage || isSessionsPage
    ? (searchParams.get('search') ?? '')
    : ''

  useEffect(() => {
    if (isAgentsPage || isSessionsPage) {
      const val = urlSearch
      if (isControlled && controlledOnChange) {
        controlledOnChange(val)
      } else {
        setInternalInput(val)
      }
    } else if (!isControlled) {
      setInternalInput('')
    }
  }, [isAgentsPage, isSessionsPage, urlSearch])

  const debouncedSetQuery = useCallback(
    debounce((v: string) => setDebouncedQuery(v), 300),
    []
  )

  const debouncedSetUrlSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (isAgentsPage || isSessionsPage) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev)
              if (value) next.set('search', value)
              else next.delete('search')
              return next
            },
            { replace: true }
          )
        }
      }, 300),
    [isAgentsPage, isSessionsPage, setSearchParams]
  )

  const handleChange = useCallback(
    (value: string) => {
      if (!isControlled) setInternalInput(value)
      controlledOnChange?.(value)
      debouncedSetQuery(value)
      debouncedSetUrlSearch(value)
    },
    [isControlled, debouncedSetQuery, debouncedSetUrlSearch, controlledOnChange]
  )

  const { data: agentsData } = useAgents({
    search: debouncedQuery.length >= 2 ? debouncedQuery : undefined,
    page_size: 5,
  })
  const { data: sessionsData } = useSessions({
    search: debouncedQuery.length >= 2 ? debouncedQuery : undefined,
    page_size: 5,
  })
  const agentSuggestions = agentsData?.agents ?? []
  const sessionSuggestions = sessionsData?.sessions ?? []

  const showSuggestions =
    isOpen && (searchInput.length >= 2 || agentSuggestions.length > 0 || sessionSuggestions.length > 0 || searchInput.length > 0)

  const handleSuggestionSelect = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleClear = useCallback(() => {
    if (!isControlled) setInternalInput('')
    controlledOnChange?.('')
    setDebouncedQuery('')
    if (isAgentsPage || isSessionsPage) {
      const next = new URLSearchParams(searchParams)
      next.delete('search')
      setSearchParams(next, { replace: true })
    }
    setIsOpen(false)
  }, [isControlled, isAgentsPage, isSessionsPage, searchParams, setSearchParams, controlledOnChange])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 pr-9"
        value={searchInput}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        aria-label="Search sessions or agents"
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-expanded={showSuggestions}
      />
      {searchInput && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {showSuggestions && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-card overflow-hidden animate-in"
          role="listbox"
        >
          <div className="max-h-[280px] overflow-y-auto">
            {agentSuggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Agents
                </p>
                {agentSuggestions.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/dashboard/agents/${agent.id}`}
                    onClick={handleSuggestionSelect}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                      'hover:bg-muted transition-colors'
                    )}
                    role="option"
                  >
                    <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{agent.name}</span>
                  </Link>
                ))}
              </div>
            )}
            {sessionSuggestions.length > 0 && (
              <div className="p-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Sessions
                </p>
                {sessionSuggestions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/dashboard/sessions/${session.id}`}
                    onClick={handleSuggestionSelect}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                      'hover:bg-muted transition-colors'
                    )}
                    role="option"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="truncate block">{session.id.slice(0, 8)}…</span>
                      <span className="text-xs text-muted-foreground truncate block">
                        {session.agent_name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchInput && (
              <div className="border-t border-border p-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Quick search
                </p>
                <Link
                  to={`/dashboard/sessions?search=${encodeURIComponent(searchInput)}`}
                  onClick={handleSuggestionSelect}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                    'hover:bg-muted transition-colors'
                  )}
                  role="option"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  Search sessions for &quot;{searchInput}&quot;
                </Link>
                <Link
                  to={`/dashboard/agents?search=${encodeURIComponent(searchInput)}`}
                  onClick={handleSuggestionSelect}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                    'hover:bg-muted transition-colors'
                  )}
                  role="option"
                >
                  <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
                  Search agents for &quot;{searchInput}&quot;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
