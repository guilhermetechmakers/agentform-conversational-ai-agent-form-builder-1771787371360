import { fetchKnowledgeBase } from '@/api/help'
import type { KnowledgeBaseArticle } from '@/types/help'

export interface SearchResult {
  id: number
  title: string
  content: string
  tags: string[]
  url: string
}

/**
 * Site-wide search using the knowledge base.
 * Returns articles matching the search query.
 */
export async function searchSite(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return []
  const sanitized = query.trim().slice(0, 200)
  const res = await fetchKnowledgeBase(sanitized, 1, 10)
  return res.articles.map((a: KnowledgeBaseArticle) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    tags: a.tags,
    url: `/help/knowledge-base?search=${encodeURIComponent(sanitized)}`,
  }))
}
