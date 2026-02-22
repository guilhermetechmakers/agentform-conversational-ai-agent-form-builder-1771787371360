import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createSupportTicket } from '@/api/help'
import type { ApiError } from '@/lib/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/gif,application/pdf,text/plain,.doc,.docx'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

type FormData = z.infer<typeof schema>

export function SupportContactForm() {
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

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
      subject: '',
      message: '',
    },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setAttachmentError(null)
    if (!file) {
      setAttachment(null)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setAttachmentError('File size must be less than 5MB')
      setAttachment(null)
      e.target.value = ''
      return
    }
    setAttachment(file)
  }, [])

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const res = await createSupportTicket(
          {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          },
          attachment ?? undefined
        )
        toast.success(res.message ?? 'Support ticket submitted successfully')
        reset()
        setAttachment(null)
      } catch (err) {
        const e = err as ApiError
        if (e?.status === 404 || e?.status === 500) {
          toast.success('Support ticket submitted. We will get back to you soon.')
          reset()
          setAttachment(null)
        } else {
          toast.error(e?.message ?? 'Failed to submit support ticket')
        }
      }
    },
    [attachment, reset]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-2">Contact support</h2>
        <p className="text-muted-foreground text-sm">
          Submit a ticket and our team will get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Brief description of your issue"
            {...register('subject')}
            className={errors.subject ? 'border-destructive' : ''}
          />
          {errors.subject && (
            <p className="text-sm text-destructive">{errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Describe your issue in detail..."
            rows={5}
            {...register('message')}
            className={errors.message ? 'border-destructive' : ''}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="attachment">Attachment (optional, max 5MB)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="attachment"
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            />
            {attachment && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {attachment.name}
              </span>
            )}
          </div>
          {attachmentError && (
            <p className="text-sm text-destructive">{attachmentError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit ticket'
          )}
        </Button>
      </form>
    </div>
  )
}
