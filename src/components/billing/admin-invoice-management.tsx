import { useState, useEffect } from 'react'
import { FileText, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Invoice } from '@/types/billing'
import { fetchAdminInvoices, resendInvoice } from '@/api/billing'

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

interface AdminInvoiceManagementProps {
  userIdFilter?: string
}

export function AdminInvoiceManagement({ userIdFilter }: AdminInvoiceManagementProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [resendingId, setResendingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchAdminInvoices({
      user_id: userIdFilter || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: 1,
      pageSize: 20,
    })
      .then((res) => {
        if (!cancelled) {
          setInvoices(res.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvoices([])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userIdFilter, statusFilter])

  const handleResend = async (invoiceId: string) => {
    setResendingId(invoiceId)
    try {
      await resendInvoice(invoiceId)
      toast.success('Invoice resent')
    } catch {
      toast.error('Failed to resend invoice')
    } finally {
      setResendingId(null)
    }
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Invoice Management</CardTitle>
        <CardDescription>
          View, resend, and manage invoices. Manually add credits or adjustments via API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                      {inv.id.slice(0, 12)}…
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResend(inv.id)}
                        disabled={resendingId === inv.id}
                        className="transition-transform hover:scale-[1.02]"
                      >
                        <Send className="h-4 w-4" />
                        Resend
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
