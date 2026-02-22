import { FileText, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Invoice } from '@/types/billing'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'outline' {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'outline'
    case 'overdue':
      return 'destructive'
    default:
      return 'secondary'
  }
}

interface InvoiceListProps {
  invoices: Invoice[]
  isLoading: boolean
  onManageBilling?: () => void
}

export function InvoiceList({ invoices, isLoading, onManageBilling }: InvoiceListProps) {
  const handleDownload = (invoiceId: string) => {
    const url = `${import.meta.env.VITE_API_URL ?? '/api'}/billing/invoices/${invoiceId}/pdf`
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Past invoices and payment status</CardDescription>
        </div>
        {onManageBilling && (
          <Button variant="outline" size="sm" onClick={onManageBilling} className="transition-transform hover:scale-[1.02]">
            Manage billing
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No invoices yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Invoices will appear here when you have billing activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(inv.status)}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(inv.id)}
                        className="transition-transform hover:scale-[1.02]"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
