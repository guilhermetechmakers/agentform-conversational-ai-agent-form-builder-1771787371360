import { useCallback, useState } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  Pencil,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { debounce } from '@/lib/utils'
import type { AdminUser, UserRole, UserStatus } from '@/types/admin'

type SortKey = 'username' | 'email' | 'role' | 'status' | 'created_at'

interface UserTableProps {
  users: AdminUser[]
  isLoading?: boolean
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: SortKey) => void
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onUpdateUser?: (id: string, updates: { status?: UserStatus; role?: UserRole }) => void
  onDeleteUser?: (id: string) => void
  onViewUser?: (user: AdminUser) => void
  onEditRole?: (user: AdminUser) => void
  search?: string
  onSearchChange?: (value: string) => void
  roleFilter?: string
  onRoleFilterChange?: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function UserTable({
  users,
  isLoading,
  sortKey = 'created_at',
  sortDir = 'desc',
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectionChange,
  onUpdateUser,
  onDeleteUser,
  onViewUser,
  onEditRole,
  search = '',
  onSearchChange,
  roleFilter = '',
  onRoleFilterChange,
  statusFilter = '',
  onStatusFilterChange,
}: UserTableProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const debouncedSearch = useCallback(
    debounce((v: string) => onSearchChange?.(v), 300),
    [onSearchChange]
  )

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSearch(value)
  }

  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.user_id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(users.map((u) => u.user_id)))
    }
  }, [allSelected, users, onSelectionChange])

  const toggleOne = useCallback(
    (id: string) => {
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectionChange(next)
    },
    [selectedIds, onSelectionChange]
  )

  const SortButton = useCallback(
    (col: SortKey) => {
      if (!onSort) return null
      const active = sortKey === col
      return (
        <button
          type="button"
          onClick={() => onSort(col)}
          className="inline-flex items-center gap-1 text-[#687076] hover:text-[#191A1D] transition-colors ml-1"
          aria-label={`Sort by ${col}`}
        >
          {active && sortDir === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : active && sortDir === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      )
    },
    [onSort, sortKey, sortDir]
  )

  if (users.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No users found</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Try adjusting your search or filters to find users.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-[#EDEDED]">
      <CardHeader className="space-y-4">
        <CardTitle>Users</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by email or username..."
              className="pl-9"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687076]" />
          </div>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#EDEDED]">
                <th className="text-left py-3 px-4 w-10 sticky left-0 bg-card z-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Username
                    {SortButton('username')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Email
                    {SortButton('email')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Role
                    {SortButton('role')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Status
                    {SortButton('status')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Created
                    {SortButton('created_at')}
                  </span>
                </th>
                <th className="text-right py-3 px-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#EDEDED]">
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : (
                users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors group"
                  >
                    <td className="py-3 px-4 sticky left-0 bg-inherit z-[1] group-hover:bg-muted/50">
                      <Checkbox
                        checked={selectedIds.has(user.user_id)}
                        onCheckedChange={() => toggleOne(user.user_id)}
                        aria-label={`Select user ${user.username}`}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-[#687076]">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.status === 'active' ? 'success' : 'destructive'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#687076] text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewUser && (
                            <DropdownMenuItem onClick={() => onViewUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View profile
                            </DropdownMenuItem>
                          )}
                          {onEditRole && (
                            <DropdownMenuItem onClick={() => onEditRole(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit role
                            </DropdownMenuItem>
                          )}
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateUser?.(user.user_id, {
                                  status: 'suspended',
                                })
                              }
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateUser?.(user.user_id, {
                                  status: 'active',
                                })
                              }
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDeleteUser?.(user.user_id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-[#EDEDED]">
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#687076]">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange?.(Number(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-[#687076] px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
