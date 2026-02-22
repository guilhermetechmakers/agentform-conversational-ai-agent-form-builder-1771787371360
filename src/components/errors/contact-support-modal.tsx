import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, WifiOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { sendSupportMessage } from '@/api/support'
import type { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  message: z.string().max(5000).optional(),
})

type FormData = z.infer<typeof schema>

interface ContactSupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ContactSupportModalComponent({ open, onOpenChange }: ContactSupportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!navigator.onLine) {
        toast.error('You appear to be offline. Please check your connection and try again.')
        return
      }

      try {
        await sendSupportMessage({
          name: data.name,
          email: data.email,
          message: data.message || undefined,
        })
        toast.success('Message received. We will get back to you soon.')
        reset()
        onOpenChange(false)
      } catch (err) {
        const e = err as ApiError
        toast.error(e?.message ?? 'Failed to send message. Please try again.')
      }
    },
    [reset, onOpenChange]
  )

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="contact-support-description"
      >
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription id="contact-support-description">
            Describe your issue and we&apos;ll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        {isOffline && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800',
              'animate-fade-in'
            )}
          >
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
            <p>You appear to be offline. Please check your connection before submitting.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-name">Name</Label>
            <Input
              id="support-name"
              placeholder="Your name"
              {...register('name')}
              className={cn(errors.name && 'border-destructive animate-shake')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'support-name-error' : undefined}
            />
            {errors.name && (
              <p id="support-name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-email">Email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn(errors.email && 'border-destructive animate-shake')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'support-email-error' : undefined}
            />
            {errors.email && (
              <p id="support-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-message">Message (optional)</Label>
            <Textarea
              id="support-message"
              placeholder="Describe your issue..."
              rows={4}
              {...register('message')}
              className={cn(errors.message && 'border-destructive animate-shake')}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'support-message-error' : undefined}
            />
            {errors.message && (
              <p id="support-message-error" className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
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
            <Button
              type="submit"
              className="bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              disabled={isSubmitting || isOffline}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ContactSupportModal = memo(ContactSupportModalComponent)
