import { useEffect, useState } from 'react'
import { Shield, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchSSOSettings,
  createSSOSetting,
  updateSSOSetting,
  deleteSSOSetting,
} from '@/api/admin'
import type { AdminSSOSetting, SSOType } from '@/types/admin'

const SSO_TYPES: SSOType[] = ['SAML', 'OIDC']

export function AdminSSOSettingsPage() {
  const [settings, setSettings] = useState<AdminSSOSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    enterprise_name: '',
    sso_type: 'SAML' as SSOType,
    metadata_url: '',
  })

  const loadSettings = () => {
    setIsLoading(true)
    setError(null)
    fetchSSOSettings()
      .then(setSettings)
      .catch((err) => setError(err?.message ?? 'Failed to load SSO settings'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const resetForm = () => {
    setForm({
      enterprise_name: '',
      sso_type: 'SAML',
      metadata_url: '',
    })
    setEditingId(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleOpenEdit = (s: AdminSSOSetting) => {
    setForm({
      enterprise_name: s.enterprise_name,
      sso_type: s.sso_type,
      metadata_url: s.metadata_url,
    })
    setEditingId(s.id)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.enterprise_name.trim() || !form.metadata_url.trim()) {
      toast.error('Enterprise name and metadata URL are required')
      return
    }
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateSSOSetting(editingId, form)
        toast.success('SSO setting updated')
      } else {
        await createSSOSetting(form)
        toast.success('SSO setting created')
      }
      setDialogOpen(false)
      resetForm()
      loadSettings()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this SSO configuration?')) return
    try {
      await deleteSSOSetting(id)
      toast.success('SSO setting deleted')
      loadSettings()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete'
      toast.error(msg)
    }
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[#191A1D]">SSO Settings</h1>
          <p className="text-[#687076] mt-1">
            Configure SAML and OIDC for enterprise login
          </p>
        </div>
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadSettings}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191A1D]">SSO Settings</h1>
          <p className="text-[#687076] mt-1">
            Configure SAML and OIDC for enterprise login
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Add SSO Configuration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit SSO Configuration' : 'Add SSO Configuration'}
              </DialogTitle>
              <DialogDescription>
                Configure SAML or OIDC for enterprise single sign-on. Users can
                select Enterprise Login on the sign-in page.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enterprise_name">Enterprise Name</Label>
                <Input
                  id="enterprise_name"
                  value={form.enterprise_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, enterprise_name: e.target.value }))
                  }
                  placeholder="Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sso_type">SSO Type</Label>
                <Select
                  value={form.sso_type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, sso_type: v as SSOType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SSO_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metadata_url">Metadata URL</Label>
                <Input
                  id="metadata_url"
                  type="url"
                  value={form.metadata_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metadata_url: e.target.value }))
                  }
                  placeholder="https://idp.example.com/metadata"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise SSO Configurations
          </CardTitle>
          <CardDescription>
            Configured identity providers for SAML and OIDC enterprise login
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : settings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#EDEDED] p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-[#191A1D]">No SSO configurations</h3>
              <p className="text-sm text-[#687076] mt-1 max-w-sm mx-auto">
                Add a SAML or OIDC configuration to enable Enterprise Login for
                your organization.
              </p>
              <Button className="mt-4" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Add SSO Configuration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[#EDEDED] bg-[#F7F8FA] hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#191A1D]">
                      {s.enterprise_name}
                    </p>
                    <p className="text-sm text-[#687076] truncate mt-0.5">
                      {s.metadata_url}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {s.sso_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(s)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
