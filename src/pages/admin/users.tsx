import { useEffect, useState, useCallback } from 'react'
import { UserTable, UserViewDialog, DeleteUserDialog, RoleEditModal } from '@/components/admin'
import { fetchUsers, updateUser, deleteUser, updateUserRole } from '@/api/admin'
import type { AdminUser, UserRole, UserStatus, RbacRole } from '@/types/admin'
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
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [roleEditUser, setRoleEditUser] = useState<AdminUser | null>(null)
  const [roleEditOpen, setRoleEditOpen] = useState(false)
  const [isRoleSaving, setIsRoleSaving] = useState(false)

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

  const handleViewUser = useCallback((user: AdminUser) => {
    setViewUser(user)
    setViewDialogOpen(true)
  }, [])

  const handleEditRole = useCallback((user: AdminUser) => {
    setRoleEditUser(user)
    setRoleEditOpen(true)
  }, [])

  const handleSaveRole = useCallback(
    async (role: RbacRole) => {
      if (!roleEditUser) return
      setIsRoleSaving(true)
      try {
        await updateUserRole(roleEditUser.user_id, role)
        toast.success('Role updated successfully')
        setRoleEditOpen(false)
        setRoleEditUser(null)
        loadUsers()
      } catch {
        toast.error('Failed to update role')
      } finally {
        setIsRoleSaving(false)
      }
    },
    [roleEditUser, loadUsers]
  )

  const handleRoleEditClose = useCallback((open: boolean) => {
    if (!open) {
      setRoleEditOpen(false)
      setRoleEditUser(null)
    }
  }, [])

  const handleDeleteUser = useCallback((id: string) => {
    const user = users.find((u) => u.user_id === id)
    setDeleteTarget(user ?? null)
    setDeleteDialogOpen(true)
  }, [users])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteUser(deleteTarget.user_id)
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteTarget.user_id)
        return next
      })
      loadUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, loadUsers])

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
        onViewUser={handleViewUser}
        onEditRole={handleEditRole}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <UserViewDialog
        user={viewUser}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userName={deleteTarget?.username ?? deleteTarget?.email}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <RoleEditModal
        open={roleEditOpen}
        onOpenChange={handleRoleEditClose}
        userName={roleEditUser?.username ?? roleEditUser?.email}
        currentRole={roleEditUser?.role ?? 'viewer'}
        onSave={handleSaveRole}
        isLoading={isRoleSaving}
      />
    </div>
  )
}
