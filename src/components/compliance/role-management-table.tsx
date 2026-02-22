import { useState, useCallback } from 'react'
import { Users, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import type { UserWithRole, RBACRole } from '@/types/compliance'

const ROLE_DESCRIPTIONS: Record<RBACRole, string> = {
  admin: 'Full access: manage all settings, view audit logs, assign roles',
  owner: 'Manage agents and settings, but cannot view audit logs',
  editor: 'Can create and modify agents',
  viewer: 'Read-only access to agents',
}

const ROLE_LABELS: Record<RBACRole, string> = {
  admin: 'Admin',
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
}

interface RoleManagementTableProps {
  users: UserWithRole[]
  isLoading?: boolean
  onUpdateRole: (userId: string, role: RBACRole) => Promise<void>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RoleManagementTable({
  users,
  isLoading,
  onUpdateRole,
}: RoleManagementTableProps) {
  const [editUser, setEditUser] = useState<UserWithRole | null>(null)
  const [selectedRole, setSelectedRole] = useState<RBACRole | ''>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenEdit = useCallback((user: UserWithRole) => {
    setEditUser(user)
    setSelectedRole(user.role)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditUser(null)
    setSelectedRole('')
  }, [])

  const handleSaveRole = useCallback(async () => {
    if (!editUser || !selectedRole) return
    setIsSaving(true)
    try {
      await onUpdateRole(editUser.id, selectedRole)
      handleCloseEdit()
    } finally {
      setIsSaving(false)
    }
  }, [editUser, selectedRole, onUpdateRole, handleCloseEdit])

  if (users.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role-Based Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No users found</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Users will appear here when they join your organization.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role-Based Access Control
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign roles to control what users can access and modify
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#EDEDED]">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 w-12" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#EDEDED]">
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
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4" />
                    </tr>
                  ))
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-[#687076]">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#687076] text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-transform hover:scale-105"
                          onClick={() => handleOpenEdit(user)}
                          aria-label="Edit role"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Edit user role</DialogTitle>
            <DialogDescription>
              {editUser && (
                <>
                  Change the role for {editUser.name} ({editUser.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as RBACRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as RBACRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <p className="text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[selectedRole]}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={isSaving || !selectedRole || selectedRole === editUser?.role}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
