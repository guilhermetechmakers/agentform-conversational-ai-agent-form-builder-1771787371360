import { useEffect, useState, useCallback } from 'react'
import { UserTable } from '@/components/admin'
import { fetchUsers, updateUser } from '@/api/admin'
import type { AdminUser, UserRole, UserStatus } from '@/types/admin'
import { toast } from 'sonner'

type SortKey = 'username' | 'email' | 'role' | 'status' | 'created_at'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadUsers = useCallback(() => {
    setIsLoading(true)
    fetchUsers({
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      page,
      pageSize,
    })
      .then((res) => {
        setUsers(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        toast.error('Failed to load users')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [search, roleFilter, statusFilter, page, pageSize])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey(key)
    setSortDir((prev) => {
      const next = prev === 'asc' ? 'desc' : 'asc'
      setUsers((users) =>
        [...users].sort((a, b) => {
          const aVal = (a as unknown as Record<string, unknown>)[key]
          const bVal = (b as unknown as Record<string, unknown>)[key]
          if (aVal == null || bVal == null) return 0
          const cmp = String(aVal).localeCompare(String(bVal))
          return next === 'asc' ? cmp : -cmp
        })
      )
      return next
    })
  }, [])

  const handleUpdateUser = useCallback(
    (id: string, updates: { status?: UserStatus; role?: UserRole }) => {
      updateUser(id, updates)
        .then(() => {
          toast.success('User updated successfully')
          loadUsers()
        })
        .catch(() => {
          toast.error('Failed to update user')
        })
    },
    [loadUsers]
  )

  const handleDeleteUser = useCallback(
    (id: string) => {
      if (!confirm('Are you sure you want to delete this user?')) return
      toast.info('Delete user – implement with API when available')
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    []
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Users</h1>
        <p className="text-[#687076] mt-1">
          Manage user accounts, roles, and status
        </p>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s)
          setPage(1)
        }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}
