import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as helpApi from '@/api/help'
import type {
  KnowledgeBaseResponse,
  FAQ,
  ChangelogEntry,
} from '@/types/help'
import type { ApiError } from '@/lib/api'

function isNetworkError(err: unknown): boolean {
  const e = err as ApiError & { message?: string }
  return (
    e?.status === 404 ||
    e?.status === 500 ||
    (typeof e?.message === 'string' &&
      (e.message.includes('fetch') ||
        e.message.includes('Failed') ||
        e.message.includes('Network')))
  )
}

const MOCK_ARTICLES: KnowledgeBaseResponse = {
  articles: [
    {
      id: 1,
      title: 'Getting started with AgentForm',
      content: 'Learn how to create your first AI agent, define fields, and publish.',
      tags: ['Getting Started', 'Basics'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Customizing agent appearance',
      content: 'Brand your chat widget with colors, logos, and custom styling.',
      tags: ['Customization', 'Appearance'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Sessions and data export',
      content: 'Understand how conversations are stored and how to export data.',
      tags: ['Sessions', 'Export'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Webhooks and integrations',
      content: 'Connect AgentForm to your backend with webhooks and API keys.',
      tags: ['Integrations', 'Webhooks'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  total: 4,
  page: 1,
  per_page: 10,
}

const MOCK_FAQS: FAQ[] = [
  {
    id: 1,
    question: 'How do I create my first agent?',
    answer:
      'Go to Dashboard → Create Agent. Define fields, set persona instructions, and publish to get a public link.',
    related_links: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    question: 'Can I customize the chat appearance?',
    answer:
      'Yes. In the Agent Builder, use the Appearance tab to set colors and branding.',
    related_links: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    question: 'How are sessions stored?',
    answer:
      'Each conversation is saved as a session with full transcript and extracted structured data. Export or use webhooks to integrate.',
    related_links: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    question: 'What file types can I upload for contextual docs?',
    answer:
      'You can upload PDF, TXT, and Markdown files. Each file is processed and used to inform the agent\'s responses.',
    related_links: [],
    created_at: new Date().toISOString(),
  },
]

const MOCK_CHANGELOG: ChangelogEntry[] = [
  {
    id: 1,
    title: 'Improved session analytics',
    description: 'Added detailed session metrics and export options.',
    status: 'New',
    release_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 2,
    title: 'Agent builder enhancements',
    description: 'Streamlined field designer and persona editor.',
    status: 'Updated',
    release_date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
  },
]

export function useKnowledgeBase(search?: string, page = 1) {
  const [data, setData] = useState<KnowledgeBaseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await helpApi.fetchKnowledgeBase(search, page)
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        const filtered = search
          ? MOCK_ARTICLES.articles.filter(
              (a) =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
            )
          : MOCK_ARTICLES.articles
        setData({
          ...MOCK_ARTICLES,
          articles: filtered,
          total: filtered.length,
          page,
        })
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load articles')
        toast.error(e?.message ?? 'Failed to load articles')
      }
    } finally {
      setIsLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useFAQs() {
  const [data, setData] = useState<FAQ[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await helpApi.fetchFAQs()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_FAQS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load FAQs')
        toast.error(e?.message ?? 'Failed to load FAQs')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useChangelog() {
  const [data, setData] = useState<ChangelogEntry[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await helpApi.fetchChangelog()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_CHANGELOG)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load changelog')
        toast.error(e?.message ?? 'Failed to load changelog')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
