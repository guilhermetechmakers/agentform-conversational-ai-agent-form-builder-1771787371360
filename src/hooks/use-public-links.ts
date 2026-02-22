import { useState, useEffect, useCallback } from 'react'
import * as publicLinksApi from '@/api/public-links'
import type { AgentPublicLinkStatus, LinkAnalytics } from '@/types/public-links'

export function useAgentsPublicLinkStatus(agentIds: string[]) {
  const [statusMap, setStatusMap] = useState<
    Record<string, AgentPublicLinkStatus>
  >({})
  const [isLoading, setIsLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (agentIds.length === 0) return
    setIsLoading(true)
    try {
      const list = await publicLinksApi.getAgentsPublicLinkStatus(agentIds)
      const map: Record<string, AgentPublicLinkStatus> = {}
      list.forEach((s) => {
        map[s.agent_id] = s
      })
      setStatusMap(map)
    } catch {
      setStatusMap({})
    } finally {
      setIsLoading(false)
    }
  }, [agentIds.join(',')])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { statusMap, isLoading, refetch: fetchStatus }
}

export function useLinkAnalytics(linkId: string | null) {
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    if (!linkId) {
      setAnalytics(null)
      return
    }
    setIsLoading(true)
    try {
      const data = await publicLinksApi.getLinkAnalytics(linkId)
      setAnalytics(data)
    } catch {
      setAnalytics(null)
    } finally {
      setIsLoading(false)
    }
  }, [linkId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, isLoading, refetch: fetchAnalytics }
}
