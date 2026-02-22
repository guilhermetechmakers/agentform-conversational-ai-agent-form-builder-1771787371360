import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, FileText, BarChart3, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminSearch } from '@/api/search'
import { debounce } from '@/lib/utils'
import { cn } from '@/lib/utils'

const QUICK_LINKS = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/logs', label: 'Logs', icon: FileText },
  { to: '/admin', label: 'Metrics', icon: BarChart3 },
]

interface AdminSearchBarProps {
  className?: string
}

export function AdminSearchBar({ className }: AdminSearchBarProps) {
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; type: string; label: string; href?: string }>
  >([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([])
        return
      }
      setIsLoading(true)
      try {
        const res = await adminSearch(query.trim())
        setSuggestions(res.suggestions)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  const handleChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  const handleClear = useCallback(() => {
    setSearchInput('')
    setSuggestions([])
    setIsOpen(false)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showSuggestions = isOpen && (searchInput.length > 0 || suggestions.length > 0)

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search users, logs, metrics..."
        className="pl-9 pr-9"
        value={searchInput}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        aria-label="Admin search"
        aria-autocomplete="list"
        aria-controls="admin-search-suggestions"
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
          id="admin-search-suggestions"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-card overflow-hidden animate-in"
          role="listbox"
        >
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="p-2">
                {suggestions.map((s) => (
                  <Link
                    key={`${s.type}-${s.id}`}
                    to={s.href ?? `/${s.type}/${s.id}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                      'hover:bg-muted transition-colors'
                    )}
                    role="option"
                  >
                    {s.type === 'user' && <Users className="h-4 w-4 text-muted-foreground shrink-0" />}
                    {s.type === 'log' && <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                    {s.type === 'metric' && <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Quick links
                </p>
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm',
                        'hover:bg-muted transition-colors'
                      )}
                      role="option"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
