import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

export interface AccountManagementProps {
  onDeleteAccount: (password: string) => Promise<void>
}

export function AccountManagement({ onDeleteAccount }: AccountManagementProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteClick = () => {
    setPassword('')
    setError(null)
    setOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      setError('Please enter your password to confirm.')
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      await onDeleteAccount(password)
      await logout()
      toast.success('Account deleted successfully')
      setOpen(false)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Incorrect password. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="animate-fade-in border-destructive/30 transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-destructive">Account Management</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showClose={true}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action is permanent. Enter your password to confirm.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleConfirmDelete()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                autoComplete="current-password"
                className={cn(error && 'border-destructive')}
                disabled={isDeleting}
              />
              {error && (
                <p className="text-sm text-destructive animate-shake" role="alert">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeleting}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isDeleting ? 'Deleting…' : 'Delete Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
