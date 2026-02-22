import { ArrowUpRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CurrentPlanSummary,
  InvoiceList,
  PaymentMethodCard,
  PlanComparison,
} from '@/components/billing'
import { useBillingSummary, useInvoices, useBillingPortal, useCheckoutSession } from '@/hooks/use-billing'

export function BillingDashboard() {
  const { data, isLoading, error, refetch } = useBillingSummary()
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()
  const { openPortal, isLoading: portalLoading } = useBillingPortal()
  const { checkout: createCheckout } = useCheckoutSession()

  const handleUpdatePayment = () => {
    openPortal()
  }

  const handleSelectPlan = (planId: string) => {
    createCheckout(planId)
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Billing & Usage
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan, payment method, and view usage
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="transition-transform hover:scale-[1.02]"
            onClick={() => openPortal()}
            disabled={portalLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage billing
          </Button>
          <Button
            size="sm"
            className="transition-transform hover:scale-[1.02]"
            onClick={() => openPortal()}
            disabled={portalLoading}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Upgrade plan
          </Button>
        </div>
      </div>

      {/* Current Plan Summary */}
      <CurrentPlanSummary data={data} isLoading={isLoading} />

      {/* Payment Method & Invoices - 2 col on lg */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentMethodCard
          data={data}
          isLoading={isLoading}
          onUpdate={handleUpdatePayment}
        />
        <InvoiceList invoices={invoices ?? []} isLoading={invoicesLoading} />
      </div>

      {/* Plan Comparison */}
      <PlanComparison
        plans={data?.plans ?? []}
        currentPlanId={data?.plan_id ?? ''}
        isLoading={isLoading}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
