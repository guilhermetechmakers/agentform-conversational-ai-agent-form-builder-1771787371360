import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { KnowledgeBaseArticle } from '@/types/help'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: KnowledgeBaseArticle
  className?: string
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const excerpt =
    article.content.length > 120 ? `${article.content.slice(0, 120)}...` : article.content

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01] cursor-pointer',
        className
      )}
    >
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-foreground">{article.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{excerpt}</p>
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
