import { useEffect, useState, useCallback } from 'react'
import { BillingOverview } from '@/components/admin'
import { fetchBilling } from '@/api/admin'
import type { AdminBilling } from '@/types/admin'
import { toast } from 'sonner'

export function AdminBillingPage() {
  const [billing, setBilling] = useState<AdminBilling[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBilling = useCallback(() => {
    setIsLoading(true)
    fetchBilling()
      .then(setBilling)
      .catch(() => {
        toast.error('Failed to load billing data')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    loadBilling()
  }, [loadBilling])

  const handleUpgrade = useCallback(() => {
    toast.info('Upgrade plan – implement with API when available')
  }, [])

  const handleDowngrade = useCallback(() => {
    toast.info('Downgrade plan – implement with API when available')
  }, [])

  const handleViewInvoices = useCallback(() => {
    toast.info('View invoices – implement with API when available')
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Billing</h1>
        <p className="text-[#687076] mt-1">
          Billing status, usage metering, and plan controls
        </p>
      </div>

      <BillingOverview
        billing={billing}
        isLoading={isLoading}
        onUpgrade={handleUpgrade}
        onDowngrade={handleDowngrade}
        onViewInvoices={handleViewInvoices}
      />
    </div>
  )
}
