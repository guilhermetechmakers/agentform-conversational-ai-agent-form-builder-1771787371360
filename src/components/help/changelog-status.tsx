import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useChangelog } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_PAGE_URL = 'https://status.agentform.io'

export function ChangelogStatus() {
  const { data, isLoading, error } = useChangelog()

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const sortedChangelog = [...(data ?? [])].sort(
    (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Changelog & Status</h2>
          <p className="text-muted-foreground text-sm">
            Recent updates and system status.
          </p>
        </div>
        <a
          href={STATUS_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          System status
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {!sortedChangelog.length ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No changelog entries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedChangelog.map((entry) => (
            <Card
              key={entry.id}
              className="transition-all duration-200 hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">{entry.title}</h3>
                  <Badge
                    variant={entry.status === 'New' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {entry.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.release_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
