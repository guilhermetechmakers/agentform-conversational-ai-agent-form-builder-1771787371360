import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserBillingSummary } from '@/types/billing'

interface PaymentMethodCardProps {
  data: UserBillingSummary | null
  isLoading: boolean
  onUpdate?: () => void
}

export function PaymentMethodCard({ data, isLoading, onUpdate }: PaymentMethodCardProps) {
  if (isLoading) {
    return (
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const pm = data.payment_method

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Your default payment method for subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        {pm?.last4 ? (
          <div className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {pm.brand ? pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1) : 'Card'} ••••{' '}
                {pm.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                {pm.expiry_month && pm.expiry_year
                  ? `Expires ${String(pm.expiry_month).padStart(2, '0')}/${pm.expiry_year}`
                  : ''}
              </p>
            </div>
            {onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUpdate}
                className="transition-transform hover:scale-[1.02] shrink-0"
              >
                Update
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No payment method</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Add a card to upgrade your plan and manage billing.
            </p>
            {onUpdate && (
              <Button
                className="mt-4 transition-transform hover:scale-[1.02]"
                onClick={onUpdate}
              >
                Add payment method
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
