import { useState, useMemo, useCallback } from 'react'
import { SearchBar } from './search-bar'
import { ArticleCard } from './article-card'
import { useKnowledgeBase } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { debounce } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

export function KnowledgeBase() {
  const [searchInput, setSearchInput] = useState('')
  const [effectiveSearch, setEffectiveSearch] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const debouncedSetSearch = useMemo(
    () =>
      debounce((v: string) => {
        setEffectiveSearch(v.trim() || undefined)
      }, 300),
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      debouncedSetSearch(value)
      setPage(1)
    },
    [debouncedSetSearch]
  )

  const { data, isLoading, error } = useKnowledgeBase(effectiveSearch, page)

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0
  const hasMore = page < totalPages
  const hasPrev = page > 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-2">Knowledge Base</h2>
        <p className="text-muted-foreground text-sm">
          Search our articles to find answers and guides.
        </p>
      </div>

      <SearchBar
        value={searchInput}
        onChange={handleSearchChange}
        placeholder="Search articles..."
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data?.articles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No articles found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term or browse all categories.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
