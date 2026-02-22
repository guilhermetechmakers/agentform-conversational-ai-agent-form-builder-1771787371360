import { useState, useEffect, useCallback } from 'react'
import { fetchTerms } from '@/api/terms'
import {
  TERMS_OF_SERVICE_SECTIONS,
  TERMS_EFFECTIVE_DATE,
  TERMS_VERSION,
} from '@/lib/terms-content'
import type { TermsSectionData } from '@/lib/terms-content'

export interface TermsState {
  sections: TermsSectionData[]
  effectiveDate: string
  version: string
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useTerms(): TermsState {
  const [sections, setSections] = useState<TermsSectionData[]>(TERMS_OF_SERVICE_SECTIONS)
  const [effectiveDate, setEffectiveDate] = useState(TERMS_EFFECTIVE_DATE)
  const [version, setVersion] = useState(TERMS_VERSION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTerms = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTerms()
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections)
      }
      if (data.effective_date) {
        setEffectiveDate(data.effective_date)
      }
      if (data.version) {
        setVersion(data.version)
      }
    } catch {
      setError('Unable to load terms. Showing cached version.')
      setSections(TERMS_OF_SERVICE_SECTIONS)
      setEffectiveDate(TERMS_EFFECTIVE_DATE)
      setVersion(TERMS_VERSION)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTerms()
  }, [loadTerms])

  return {
    sections,
    effectiveDate,
    version,
    isLoading,
    error,
    retry: loadTerms,
  }
}
