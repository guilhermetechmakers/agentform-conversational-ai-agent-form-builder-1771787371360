import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, CheckCircle, Loader2, Mail, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { verifyEmail, resendVerification } from '@/api/auth'
import type { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResendForm = z.infer<typeof resendSchema>

type VerificationStatus =
  | 'loading'
  | 'success'
  | 'error'
  | 'no_token'
  | 'offline'

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'This verification link has expired. Please request a new one.',
  already_used:
    'This verification link has already been used. You can sign in to your account.',
  invalid: 'This verification link is invalid. Please request a new one.',
}

function getErrorMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('expired')) return ERROR_MESSAGES.expired
  if (lower.includes('already') || lower.includes('used')) return ERROR_MESSAGES.already_used
  if (lower.includes('invalid') || lower.includes('not found')) return ERROR_MESSAGES.invalid
  return message || 'There was an issue verifying your email. Please try again or contact support.'
}

function isOfflineError(err: unknown): boolean {
  const apiErr = err as ApiError & { message?: string }
  const msg = String(apiErr?.message ?? '')
  return (
    apiErr?.status === 404 ||
    msg.includes('fetch') ||
    msg.includes('Failed') ||
    msg.includes('Network') ||
    msg.includes('offline')
  )
}

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const emailFromUrl = searchParams.get('email')

  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const resendForm = useForm<ResendForm>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: emailFromUrl ?? '' },
  })

  const verify = useCallback(async (token: string) => {
    try {
      const res = await verifyEmail({ token })
      if (res.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(getErrorMessage(res.message))
      }
    } catch (err) {
      if (isOfflineError(err)) {
        setStatus('offline')
      } else {
        setStatus('error')
        const apiErr = err as ApiError & { message?: string }
        setErrorMessage(getErrorMessage(apiErr?.message ?? 'Verification failed'))
      }
    }
  }, [])

  useEffect(() => {
    if (!tokenFromUrl) {
      setStatus('no_token')
      return
    }
    setStatus('loading')
    verify(tokenFromUrl)
  }, [tokenFromUrl, verify])

  useEffect(() => {
    if (emailFromUrl) {
      resendForm.setValue('email', emailFromUrl)
    }
  }, [emailFromUrl, resendForm])

  const onResend = async (data: ResendForm) => {
    setIsResending(true)
    setResendSuccess(false)
    try {
      const res = await resendVerification({ email: data.email })
      if (res.success) {
        setResendSuccess(true)
        toast.success('Verification email sent. Check your inbox.')
      } else {
        toast.error(res.message || 'Failed to send verification email.')
      }
    } catch (err) {
      if (isOfflineError(err)) {
        toast.error('Verification actions are unavailable offline.')
      } else {
        const apiErr = err as ApiError & { message?: string }
        toast.error(apiErr?.message ?? 'Failed to send verification email.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isNoToken = status === 'no_token'
  const isOffline = status === 'offline'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft" />
      </div>

      <Card className="w-full max-w-md relative animate-fade-in-up shadow-card rounded-[12px] overflow-hidden">
        <CardHeader className="space-y-1 text-left px-6 sm:px-8 pt-8 pb-4">
          <Link to="/" className="flex items-center gap-2 mb-4 w-fit">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
          </Link>
          <CardTitle className="text-2xl font-bold text-[#191A1D]">
            {isLoading && 'Verifying your email...'}
            {isSuccess && 'Email verified'}
            {isError && 'Verification failed'}
            {isNoToken && 'Invalid link'}
            {isOffline && 'Offline'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-left">
            {isLoading &&
              'Please wait while we verify your email address.'}
            {isSuccess &&
              'Your email has been successfully verified! Welcome aboard.'}
            {isError && (errorMessage || 'There was an issue verifying your email. Please try again or contact support.')}
            {isNoToken &&
              'This page requires a valid verification link. Check your email or request a new verification link.'}
            {isOffline &&
              'Verification actions are unavailable while offline. Please check your connection and try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {isSuccess && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center shadow-md">
                  <CheckCircle className="h-8 w-8 text-accent-foreground" />
                </div>
              </div>
              <Button
                asChild
                className="w-full h-11 rounded-[12px] bg-[#FFE066] text-[#191A1D] font-medium hover:bg-[#F5D84D] hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {(isError || isNoToken) && !isLoading && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              {!isOffline && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">
                    Resend verification email
                  </p>
                  <form
                    onSubmit={resendForm.handleSubmit(onResend)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="resend-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="resend-email"
                          type="email"
                          placeholder="you@example.com"
                          className={cn(
                            'pl-9',
                            resendForm.formState.errors.email &&
                              'animate-shake border-destructive'
                          )}
                          {...resendForm.register('email')}
                        />
                      </div>
                      {resendForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {resendForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-[12px] bg-[#FFE066] text-[#191A1D] font-medium hover:bg-[#F5D84D] hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend verification email'
                      )}
                    </Button>
                  </form>
                  {resendSuccess && (
                    <p className="text-sm text-green-600 font-medium animate-fade-in">
                      Verification email sent. Check your inbox.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            </div>
          )}

          {isOffline && !isLoading && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
