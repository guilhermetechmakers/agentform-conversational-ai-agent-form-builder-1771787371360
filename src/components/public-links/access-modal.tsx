import { useState } from 'react'
import { Key, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

interface AccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (password: string) => Promise<void>
  error?: string | null
  onClearError?: () => void
}

export function AccessModal({
  open,
  onOpenChange,
  onSubmit,
  error,
  onClearError,
}: AccessModalProps) {
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setIsSubmitting(true)
    onClearError?.()
    try {
      await onSubmit(password.trim())
      setPassword('')
      onOpenChange(false)
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showClose={false}
        onPointerDownOutside={() => onClearError?.()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password required
            </DialogTitle>
            <DialogDescription>
              This agent link is password-protected. Enter the password to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="access-password">Password</Label>
              <Input
                id="access-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  onClearError?.()
                }}
                placeholder="Enter password"
                autoFocus
                autoComplete="current-password"
                className={cn(
                  'transition-all duration-200',
                  error && 'border-destructive animate-shake'
                )}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!password.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
