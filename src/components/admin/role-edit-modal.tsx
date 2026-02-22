import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import type { RbacRole } from '@/types/admin'

const ROLE_DESCRIPTIONS: Record<RbacRole, string> = {
  admin: 'Full access: manage all settings, users, and view audit logs.',
  owner: 'Manage agents and settings, but cannot view audit logs.',
  editor: 'Can create and modify agents.',
  viewer: 'Read-only access to view agents.',
}

interface RoleEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  currentRole: RbacRole | string
  onSave: (role: RbacRole) => void
  isLoading?: boolean
}

export function RoleEditModal({
  open,
  onOpenChange,
  userName,
  currentRole,
  onSave,
  isLoading = false,
}: RoleEditModalProps) {
  const rbacRoles: RbacRole[] = ['admin', 'owner', 'editor', 'viewer']
  const [selectedRole, setSelectedRole] = useState<RbacRole>(
    rbacRoles.includes(currentRole as RbacRole) ? (currentRole as RbacRole) : 'viewer'
  )

  useEffect(() => {
    if (open) {
      setSelectedRole(
        rbacRoles.includes(currentRole as RbacRole) ? (currentRole as RbacRole) : 'viewer'
      )
    }
  }, [open, currentRole])

  const handleSave = () => {
    onSave(selectedRole)
    // Parent closes modal on success
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit user role</DialogTitle>
          <DialogDescription>
            {userName
              ? `Assign a role to ${userName}. Role determines what actions the user can perform.`
              : 'Select a role for this user. Role determines what actions the user can perform.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="role">Role</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="font-medium mb-1">Role descriptions</p>
                    <ul className="text-xs space-y-1">
                      {rbacRoles.map((r) => (
                        <li key={r}>
                          <span className="font-medium capitalize">{r}:</span>{' '}
                          {ROLE_DESCRIPTIONS[r]}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as RbacRole)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rbacRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="capitalize">{role}</span> — {ROLE_DESCRIPTIONS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
