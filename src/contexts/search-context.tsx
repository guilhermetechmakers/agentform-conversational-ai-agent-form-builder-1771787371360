import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SearchFilters, SearchSuggestion } from '@/types/search'

export type SearchContextType = 'sessions' | 'agents' | 'admin' | 'global'

interface SearchContextValue {
  query: string
  setQuery: (q: string) => void
  filters: SearchFilters
  setFilters: (f: SearchContextValue['filters']) => void
  suggestions: SearchSuggestion[]
  setSuggestions: (s: SearchSuggestion[]) => void
  contextType: SearchContextType
  setContextType: (t: SearchContextType) => void
  recentSearches: string[]
  addRecentSearch: (q: string) => void
  clearRecentSearches: () => void
  /** Pending search to apply when navigating to sessions (e.g. from dashboard search) */
  pendingSessionsSearch: string | null
  setPendingSessionsSearch: (q: string | null) => void
}

const defaultFilters: SearchFilters = {}

const SearchContext = createContext<SearchContextValue | null>(null)

const RECENT_SEARCHES_KEY = 'agentform-recent-searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function saveRecentSearches(items: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('')
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [contextType, setContextType] = useState<SearchContextType>('global')
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches)
  const [pendingSessionsSearch, setPendingSessionsSearch] = useState<string | null>(null)

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
  }, [])

  const addRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return
    setRecentSearches((prev) => {
      const next = [q.trim(), ...prev.filter((x) => x !== q.trim())].slice(0, MAX_RECENT)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    saveRecentSearches([])
  }, [])

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      filters,
      setFilters,
      suggestions,
      setSuggestions,
      contextType,
      setContextType,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      pendingSessionsSearch,
      setPendingSessionsSearch,
    }),
    [
      query,
      setQuery,
      filters,
      suggestions,
      contextType,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      pendingSessionsSearch,
    ]
  )

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return ctx
}

export function useSearchOptional() {
  return useContext(SearchContext)
}
