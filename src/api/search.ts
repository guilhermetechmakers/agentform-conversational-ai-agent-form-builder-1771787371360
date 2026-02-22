import { apiGet, apiPost } from '@/lib/api'
import type { SearchParams, SearchResponse, SearchSuggestion } from '@/types/search'
import * as sessionsApi from '@/api/sessions'
import * as agentsApi from '@/api/agents'
import { fetchKnowledgeBase } from '@/api/help'
import type { KnowledgeBaseArticle } from '@/types/help'

export interface SearchResult {
  id: number
  title: string
  content: string
  tags: string[]
  url: string
}

/** Site-wide search using the knowledge base (for 404 page, etc.) */
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

/** Search sessions - uses sessions API with search params for compatibility */
export async function searchSessions(
  params: SearchParams
): Promise<SearchResponse> {
  const sessionsParams = {
    search: params.query || undefined,
    agent_id: params.filters?.agent_id,
    status: params.filters?.status as 'completed' | 'incomplete' | 'in-progress' | undefined,
    tag: params.filters?.tag,
    date_from: params.filters?.date_from,
    date_to: params.filters?.date_to,
    field_name: params.filters?.field_name,
    field_value: params.filters?.field_value,
    page: params.page ?? 1,
    page_size: params.page_size ?? 10,
  }
  const res = await sessionsApi.fetchSessions(sessionsParams)
  return {
    results: res.sessions,
    total_pages: Math.ceil(res.total / (params.page_size ?? 10)) || 1,
    current_page: res.page,
    total: res.total,
  }
}

/** Cache search results - for future ElasticSearch integration */
export async function cacheSearchResults(
  query: string,
  results: unknown
): Promise<{ success: boolean }> {
  try {
    await apiPost<{ success: boolean }>('/search/cache', { query, results })
    return { success: true }
  } catch {
    return { success: false }
  }
}

/** Dashboard search suggestions - agents and sessions for quick access */
export async function getSearchSuggestions(
  query: string,
  limit = 6
): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 2) return []
  const q = query.trim().slice(0, 100)
  const suggestions: SearchSuggestion[] = []
  try {
    const [agentsRes, sessionsRes] = await Promise.all([
      agentsApi.fetchAgents({ search: q, page_size: 5 }),
      sessionsApi.fetchSessions({ search: q, page_size: 5 }),
    ])
    agentsRes.agents.forEach((a) => {
      suggestions.push({
        id: `agent-${a.id}`,
        type: 'agent',
        label: a.name,
        subtitle: `${a.sessions_count ?? 0} sessions`,
        href: `/dashboard/agents/${a.id}`,
      })
    })
    sessionsRes.sessions.forEach((s) => {
      suggestions.push({
        id: `session-${s.id}`,
        type: 'session',
        label: `${s.id.slice(0, 8)}…`,
        subtitle: `${s.agent_name} · ${s.status}`,
        href: `/dashboard/sessions/${s.id}`,
      })
    })
    return suggestions.slice(0, limit)
  } catch {
    return []
  }
}

/** Admin search - users, logs, metrics (unified endpoint) */
export async function adminSearch(
  query: string,
  type?: 'users' | 'logs' | 'metrics'
): Promise<{ suggestions: Array<{ id: string; type: string; label: string; href?: string }> }> {
  try {
    const res = await apiGet<{ suggestions: Array<{ id: string; type: string; label: string; href?: string }> }>(
      `/admin/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`
    )
    return res
  } catch {
    const q = query.toLowerCase().trim()
    if (q.length < 2) return { suggestions: [] }
    const mock: Array<{ id: string; type: string; label: string; href?: string }> = []
    const mockUsers = [
      { id: 'u1', username: 'admin@example.com', role: 'admin' },
      { id: 'u2', username: 'user@example.com', role: 'user' },
    ]
    const mockLogs = [
      { id: 'log1', message: 'User login successful' },
      { id: 'log2', message: 'Webhook delivered' },
    ]
    for (const u of mockUsers) {
      if (u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
        mock.push({
          id: u.id,
          type: 'user',
          label: u.username,
          href: '/admin/users',
        })
      }
    }
    for (const l of mockLogs) {
      if (l.message.toLowerCase().includes(q)) {
        mock.push({
          id: l.id,
          type: 'log',
          label: l.message,
          href: '/admin/logs',
        })
      }
    }
    return { suggestions: mock.slice(0, 6) }
  }
}
