import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RequestForm = z.infer<typeof requestSchema>
type ResetForm = z.infer<typeof resetSchema>

export function PasswordResetPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'requestSuccess' | 'resetSuccess'>('request')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onRequest = async (data: RequestForm) => {
    setIsSubmitting(true)
    try {
      // Mock: simulate API call
      await new Promise((r) => setTimeout(r, 800))
      setEmail(data.email)
      setStep('requestSuccess')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onReset = async () => {
    setIsSubmitting(true)
    try {
      // Mock: simulate API call
      await new Promise((r) => setTimeout(r, 800))
      setStep('resetSuccess')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <Link to="/" className="flex justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AgentForm</span>
          </Link>
          <CardTitle className="text-2xl">
            {step === 'request' && 'Reset password'}
            {step === 'reset' && 'Create new password'}
            {step === 'requestSuccess' && 'Check your email'}
            {step === 'resetSuccess' && 'Password reset'}
          </CardTitle>
          <CardDescription>
            {step === 'request' &&
              'Enter your email and we\'ll send you a reset link'}
            {step === 'reset' &&
              'Enter your new password below'}
            {step === 'requestSuccess' &&
              `We sent a reset link to ${email}`}
            {step === 'resetSuccess' &&
              'Your password has been reset. You can now sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'request' && (
            <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...requestForm.register('email')}
                />
                {requestForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}
          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register('password')}
                />
                {resetForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register('confirmPassword')}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset password'}
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
              <Button asChild className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          )}
          {step === 'requestSuccess' && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Didn't receive the email?{' '}
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
          {step !== 'requestSuccess' && step !== 'resetSuccess' && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
