import { Search, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { debounce } from '@/lib/utils'
import type { AdminUserBilling } from '@/types/billing'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

interface UserBillingTableProps {
  data: AdminUserBilling[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  search?: string
  onSearchChange?: (value: string) => void
  planFilter?: string
  onPlanFilterChange?: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function UserBillingTable({
  data,
  total,
  page,
  pageSize,
  isLoading,
  search = '',
  onSearchChange,
  planFilter = '',
  onPlanFilterChange,
  statusFilter = '',
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
}: UserBillingTableProps) {
  const debouncedSearch = debounce((v: string) => onSearchChange?.(v), 300)
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <Card className="rounded-xl border-border transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Billing Overview
        </CardTitle>
        <CardDescription>
          Search and filter users by billing status
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              className="pl-9"
              defaultValue={search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <Select value={planFilter} onValueChange={onPlanFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All plans</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No users found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">User</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Usage</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount Due</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.user_id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{row.name}</p>
                          <p className="text-sm text-muted-foreground">{row.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{row.plan}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {row.sessions_used.toLocaleString()} / {row.sessions_limit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(row.amount_due)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.status === 'active' ? 'default' : 'outline'}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => onPageSizeChange?.(Number(v))}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange?.(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange?.(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
