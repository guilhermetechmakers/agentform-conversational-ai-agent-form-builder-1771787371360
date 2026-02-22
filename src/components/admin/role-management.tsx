import { useCallback, useEffect, useState } from 'react'
import { Users, Pencil } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { fetchUsers, updateUserRole } from '@/api/admin'
import type { AdminUser, RbacRole } from '@/types/admin'
import { toast } from 'sonner'

const RBAC_ROLES: { value: RbacRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access: manage all settings, users, and view audit logs' },
  { value: 'owner', label: 'Owner', description: 'Manage agents and settings, but cannot view audit logs' },
  { value: 'editor', label: 'Editor', description: 'Can create and modify agents' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to agents' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RoleManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState<RbacRole | ''>('')
  const [isSaving, setIsSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchUsers({ pageSize: 50 })
      setUsers(res.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleEditRole = useCallback((user: AdminUser) => {
    setEditUser(user)
    const r = user.role as string
    setEditRole(
      ['admin', 'owner', 'editor', 'viewer'].includes(r) ? (r as RbacRole) : 'viewer'
    )
    setDialogOpen(true)
  }, [])

  const handleSaveRole = useCallback(async () => {
    if (!editUser || !editRole) return
    setIsSaving(true)
    try {
      await updateUserRole(editUser.user_id, editRole as RbacRole)
      toast.success('Role updated successfully')
      setDialogOpen(false)
      setEditUser(null)
      setEditRole('')
      loadUsers()
    } catch {
      toast.error('Failed to update role')
    } finally {
      setIsSaving(false)
    }
  }, [editUser, editRole, loadUsers])

  const handleClose = useCallback(() => {
    setDialogOpen(false)
    setEditUser(null)
    setEditRole('')
  }, [])

  if (isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          RBAC Management
        </CardTitle>
        <CardDescription>
          Assign roles to users. Admin can manage all settings; Owner manages agents; Editor modifies; Viewer reads only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#EDEDED]">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-right py-3 px-4 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{user.username}</td>
                  <td className="py-3 px-4 text-[#687076]">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{user.role}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#687076] text-sm">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(user)}
                      className="transition-transform hover:scale-[1.02]"
                      aria-label={`Edit role for ${user.username}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">No users found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Users will appear here when they sign up.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user role</DialogTitle>
            <DialogDescription>
              {editUser && (
                <>Change role for {editUser.username} ({editUser.email})</>
              )}
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium mb-1">Role descriptions</p>
                        <ul className="text-xs space-y-1">
                          {RBAC_ROLES.map((r) => (
                            <li key={r.value}>
                              <span className="font-medium">{r.label}:</span> {r.description}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={editRole}
                  onValueChange={(v) => setEditRole(v as RbacRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {RBAC_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label} — {r.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!editRole || isSaving}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
