import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Loader2, Home, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { debounce } from '@/lib/utils'
import { log404Error } from '@/api/errors'
import { searchSite, type SearchResult } from '@/api/search'
import { toast } from 'sonner'

function ErrorMessage() {
  return (
    <header className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#191A1D] tracking-tight">
        Oops! Page not found.
      </h1>
      <p className="mt-3 text-base font-medium text-[#687076] max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
    </header>
  )
}

interface SearchBoxProps {
  onResultClick?: () => void
}

function SearchBox({ onResultClick }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const performSearch = useCallback(async (term: string) => {
    const sanitized = term.trim().replace(/[<>"']/g, '')
    if (!sanitized) {
      setResults([])
      setHasSearched(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchSite(sanitized)
      setResults(data)
      setHasSearched(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      setResults([])
      setHasSearched(true)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedSearch = useMemo(
    () => debounce((v: string) => performSearch(v), 300),
    [performSearch]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        navigate(`/help/knowledge-base?search=${encodeURIComponent(trimmed)}`)
        onResultClick?.()
      }
    },
    [query, navigate, onResultClick]
  )

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      navigate(result.url)
      onResultClick?.()
    },
    [navigate, onResultClick]
  )

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Search our site..."
          className={cn(
            'h-11 rounded-[12px] border border-[#EDEDED] pr-10 pl-4',
            'placeholder:text-[#687076]',
            'focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-400'
          )}
          aria-label="Search our site"
          aria-describedby={error ? 'search-error' : undefined}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-[#687076] animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4 text-[#687076]" aria-hidden />
          )}
        </div>
      </form>

      {error && (
        <p id="search-error" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {hasSearched && !isLoading && (
        <div className="mt-4 animate-fade-in">
          {results.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="text-sm text-[#687076] mt-1">
                Try a different search term or browse our help center.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
              <div className="p-2 max-h-48 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg',
                      'hover:bg-muted/80 transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <span className="font-medium text-foreground">{result.title}</span>
                    <p className="text-sm text-[#687076] mt-0.5 line-clamp-1">
                      {result.content.slice(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2 bg-muted/30">
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = query.trim()
                    if (trimmed) {
                      navigate(`/help/knowledge-base?search=${encodeURIComponent(trimmed)}`)
                      onResultClick?.()
                    }
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all results in Help Center →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NavigationLinks() {
  return (
    <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        asChild
        className={cn(
          'bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]/90',
          'rounded-lg px-6 h-11 font-medium',
          'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
        )}
      >
        <Link to="/">
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className={cn(
          'bg-transparent text-[#FF5A5F] border-2 border-[#FF5A5F]',
          'rounded-lg px-6 h-11 font-medium',
          'hover:bg-[#FF5A5F]/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
        )}
      >
        <Link to="/help/contact">
          <AlertCircle className="h-4 w-4" />
          Report this issue
        </Link>
      </Button>
    </nav>
  )
}

function NotFoundFooter() {
  return (
    <footer className="mt-12">
      <p className="text-sm text-[#687076] text-center">
        If you believe this page should exist, please contact support.
      </p>
    </footer>
  )
}

export function NotFoundPage() {
  useEffect(() => {
    const payload = {
      url: window.location.href,
      referrer: document.referrer || '',
      user_agent: navigator.userAgent,
    }
    log404Error(payload).catch(() => {
      // Silently ignore - don't disrupt UX for logging failures
    })
  }, [])

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16',
        'animate-fade-in'
      )}
    >
      <div className="flex flex-col items-center gap-8 max-w-lg w-full">
        <ErrorMessage />
        <SearchBox />
        <NavigationLinks />
        <NotFoundFooter />
      </div>
    </div>
  )
}
