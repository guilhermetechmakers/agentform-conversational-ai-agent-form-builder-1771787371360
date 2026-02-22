import { useState, useEffect, useCallback } from 'react'
import { Shield, Lock, Globe, Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  fetchAgentAccessControl,
  updateAgentAccessControl,
} from '@/api/compliance'
import type { RBACRole, AgentVisibility } from '@/types/compliance'
import { toast } from 'sonner'

const ROLE_LABELS: Record<RBACRole, string> = {
  admin: 'Admin',
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
}

interface AccessControlPanelProps {
  agentId: string | undefined
  isNew: boolean
}

export function AccessControlPanel({ agentId, isNew }: AccessControlPanelProps) {
  const [visibility, setVisibility] = useState<AgentVisibility>('public')
  const [allowedRoles, setAllowedRoles] = useState<RBACRole[]>([])
  const [isLoading, setIsLoading] = useState(!isNew && !!agentId)
  const [manageOpen, setManageOpen] = useState(false)
  const [localVisibility, setLocalVisibility] = useState<AgentVisibility>('public')
  const [localRoles, setLocalRoles] = useState<RBACRole[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    if (!agentId || isNew) return
    setIsLoading(true)
    try {
      const res = await fetchAgentAccessControl(agentId)
      setVisibility(res.visibility)
      setAllowedRoles(res.allowed_roles)
      setLocalVisibility(res.visibility)
      setLocalRoles([...res.allowed_roles])
    } catch {
      setVisibility('public')
      setAllowedRoles(['admin', 'owner', 'editor', 'viewer'])
      setLocalVisibility('public')
      setLocalRoles(['admin', 'owner', 'editor', 'viewer'])
    } finally {
      setIsLoading(false)
    }
  }, [agentId, isNew])

  useEffect(() => {
    load()
  }, [load])

  const handleOpenManage = useCallback(() => {
    setLocalVisibility(visibility)
    setLocalRoles([...allowedRoles])
    setManageOpen(true)
  }, [visibility, allowedRoles])

  const handleToggleRole = useCallback((role: RBACRole) => {
    setLocalRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }, [])

  const handleSaveAccess = useCallback(async () => {
    if (!agentId || isNew) return
    setIsSaving(true)
    try {
      await updateAgentAccessControl(agentId, {
        visibility: localVisibility,
        allowed_roles: localRoles,
      })
      setVisibility(localVisibility)
      setAllowedRoles([...localRoles])
      setManageOpen(false)
      toast.success('Access control updated')
    } catch {
      toast.error('Failed to update access control')
    } finally {
      setIsSaving(false)
    }
  }, [agentId, isNew, localVisibility, localRoles])

  if (isNew) {
    return (
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Save the agent first to configure access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Access control settings will be available after you create the agent.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>
    )
  }

  const isPublic = visibility === 'public'

  return (
    <>
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Control who can view and use this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {isPublic ? 'Public' : 'Restricted'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? 'Anyone with the link can access'
                    : `Limited to ${allowedRoles.length} role(s)`}
                </p>
              </div>
            </div>
            <Badge variant={isPublic ? 'default' : 'secondary'}>
              {isPublic ? 'Public' : 'Restricted'}
            </Badge>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start transition-transform hover:scale-[1.02]"
            onClick={handleOpenManage}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage access
          </Button>
        </CardContent>
      </Card>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent showClose={true} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage access</DialogTitle>
            <DialogDescription>
              Set visibility and which roles can access this agent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Visibility</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={localVisibility === 'public'}
                    onChange={() => setLocalVisibility('public')}
                    className="rounded-full"
                  />
                  <Globe className="h-4 w-4" />
                  Public
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={localVisibility === 'restricted'}
                    onChange={() => setLocalVisibility('restricted')}
                    className="rounded-full"
                  />
                  <Lock className="h-4 w-4" />
                  Restricted
                </label>
              </div>
            </div>

            {localVisibility === 'restricted' && (
              <div className="space-y-3">
                <Label>Allowed roles</Label>
                <div className="space-y-2">
                  {(Object.keys(ROLE_LABELS) as RBACRole[]).map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={localRoles.includes(role)}
                        onCheckedChange={() => handleToggleRole(role)}
                      />
                      {ROLE_LABELS[role]}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAccess} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
