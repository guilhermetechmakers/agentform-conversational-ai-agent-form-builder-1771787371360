import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, CheckCircle, Loader2 } from 'lucide-react'
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
import { PasswordInputWithStrength } from '@/components/auth/password-input-with-strength'
import { NotificationBanner } from '@/components/auth/notification-banner'
import { requestPasswordReset, updatePassword } from '@/api/auth'
import { cn } from '@/lib/utils'

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RequestForm = z.infer<typeof requestSchema>
type ResetForm = z.infer<typeof resetSchema>

export function PasswordResetPage() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')

  const [step, setStep] = useState<'request' | 'reset' | 'requestSuccess' | 'resetSuccess'>(
    'request'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [showExpiryBanner, setShowExpiryBanner] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const watchedEmail = requestForm.watch('email')
  const requestIsValid = !!watchedEmail && !requestForm.formState.errors.email

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      setStep('reset')
    }
  }, [tokenFromUrl])

  const onRequest = async (data: RequestForm) => {
    setIsSubmitting(true)
    setShowExpiryBanner(false)
    try {
      await requestPasswordReset({ email: data.email })
      setEmail(data.email)
      setStep('requestSuccess')
      toast.success('Reset link sent. Check your email.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onReset = async (data: ResetForm) => {
    if (!token) {
      setShowExpiryBanner(true)
      return
    }
    setIsSubmitting(true)
    setShowExpiryBanner(false)
    try {
      await updatePassword({ token, newPassword: data.password })
      setStep('resetSuccess')
      toast.success('Password reset successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'The reset link has expired or is invalid.'
      setShowExpiryBanner(true)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTryAgain = () => {
    setStep('request')
    setToken(null)
    setShowExpiryBanner(false)
    resetForm.reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft" />
      </div>

      <div className="w-full max-w-md space-y-4">
        {showExpiryBanner && (
          <NotificationBanner
            message="The reset link has expired or is invalid"
            variant="error"
            onDismiss={() => setShowExpiryBanner(false)}
            className="animate-fade-in-up"
          />
        )}

        <Card className="w-full relative animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1 text-center">
            <Link to="/" className="flex justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">AgentForm</span>
            </Link>
            <CardTitle className="text-2xl text-foreground">
              {step === 'request' && 'Reset password'}
              {step === 'reset' && 'Create new password'}
              {step === 'requestSuccess' && 'Check your email'}
              {step === 'resetSuccess' && 'Password reset'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 'request' &&
                "Enter your email and we'll send you a reset link"}
              {step === 'reset' && 'Enter your new password below'}
              {step === 'requestSuccess' && `We sent a reset link to ${email}`}
              {step === 'resetSuccess' &&
                'Your password has been reset. You can now sign in.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'request' && (
              <form
                onSubmit={requestForm.handleSubmit(onRequest)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={cn(
                      requestForm.formState.errors.email &&
                        'animate-shake border-destructive'
                    )}
                    {...requestForm.register('email')}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
                  disabled={!requestIsValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form
                onSubmit={resetForm.handleSubmit(onReset)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInputWithStrength
                    id="password"
                    placeholder="New Password"
                    error={resetForm.formState.errors.password?.message}
                    {...resetForm.register('password')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className={cn(
                      resetForm.formState.errors.confirmPassword &&
                        'animate-shake border-destructive'
                    )}
                    {...resetForm.register('confirmPassword')}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}

            {(step === 'requestSuccess' || step === 'resetSuccess') && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-accent-foreground" />
                  </div>
                </div>
                <Button asChild className="w-full h-11">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            )}

            {step === 'requestSuccess' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-primary font-medium hover:underline"
                >
                  Try again
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => setStep('reset')}
                  className="text-primary font-medium hover:underline"
                >
                  Have the link? Reset password
                </button>
              </p>
            )}

            {step === 'reset' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="text-primary font-medium hover:underline"
                >
                  Request a new reset link
                </button>
              </p>
            )}

            {step !== 'requestSuccess' && step !== 'resetSuccess' && step !== 'reset' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
