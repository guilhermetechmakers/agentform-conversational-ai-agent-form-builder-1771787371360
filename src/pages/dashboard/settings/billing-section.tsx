import { useBillingSummary, useBillingPortal, useCheckoutSession } from '@/hooks/use-billing'
import {
  CurrentPlanSummary,
  InvoiceList,
  PaymentMethodCard,
  PlanComparison,
} from '@/components/billing'

export function BillingSection() {
  const { data, isLoading, error, refetch } = useBillingSummary()
  const { openPortal } = useBillingPortal()
  const { checkout } = useCheckoutSession()

  const handleManageBilling = () => {
    openPortal()
  }

  const handleSelectPlan = (planId: string) => {
    checkout(planId)
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Billing & Usage
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, usage, payment methods, and invoices
        </p>
      </div>

      <CurrentPlanSummary data={data} isLoading={isLoading} />

      <div className="grid gap-8 lg:grid-cols-2">
        <PaymentMethodCard
          data={data}
          isLoading={isLoading}
          onUpdate={handleManageBilling}
        />
        <InvoiceList
          invoices={data?.invoices ?? []}
          isLoading={isLoading}
        />
      </div>

      <PlanComparison
        plans={data?.plans ?? []}
        currentPlanId={data?.plan_id ?? 'free'}
        isLoading={isLoading}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
