import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PasswordInput } from '@/components/auth/password-input'
import { AlertMessage } from '@/components/auth/alert-message'
import { OAuthButton } from '@/components/auth/oauth-button'
import { SSOButton } from '@/components/auth/sso-button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REQUIREMENTS =
  'At least 8 characters, one letter, and one number required.'

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one number')

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

export function LoginSignupPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const navigate = useNavigate()
  const { login, signup, initiateOAuth, initiateSSO } = useAuth()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', acceptTerms: false },
  })

  const onLogin = async (data: LoginForm) => {
    setFormError(null)
    setIsSubmitting(true)
    try {
      await login(data.email, data.password, data.rememberMe ?? false)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password'
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSignup = async (data: SignupForm) => {
    setFormError(null)
    setIsSubmitting(true)
    try {
      const result = await signup(data.email, data.password, data.acceptTerms)
      if (result.needsVerification) {
        setVerificationEmail(data.email)
        setShowVerificationMessage(true)
        toast.success('Check your email to verify your account')
      } else {
        toast.success('Account created successfully')
        navigate('/dashboard')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOAuth = (provider: 'google' | 'microsoft' | 'github') => {
    initiateOAuth(provider)
  }

  const handleEnterpriseLogin = async () => {
    setFormError(null)
    setIsSubmitting(true)
    try {
      await initiateSSO()
    } catch {
      const message = 'Enterprise login is not configured. Contact your administrator.'
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModeSwitch = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setFormError(null)
    loginForm.clearErrors()
    signupForm.clearErrors()
  }

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft" />
        </div>
        <Card className="w-full max-w-md relative animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1 text-center">
            <Link to="/" className="flex justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
            </Link>
            <CardTitle className="text-2xl text-[#191A1D]">
              Check your email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We sent a verification link to{' '}
              <span className="font-medium text-foreground">{verificationEmail}</span>.
              Click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/verify-email">Go to verification</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setShowVerificationMessage(false)
                  setVerificationEmail('')
                }}
                className="text-primary font-medium hover:underline"
              >
                Use a different email
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft" />
      </div>
      <Card className="w-full max-w-md relative animate-fade-in-up shadow-card">
        <CardHeader className="space-y-1 text-center pb-4">
          <Link to="/" className="flex justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
          </Link>
          <div className="flex rounded-lg bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => mode !== 'login' && handleModeSwitch()}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                mode === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => mode !== 'signup' && handleModeSwitch()}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                mode === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign up
            </button>
          </div>
          <CardTitle className="text-2xl text-[#191A1D] pt-2">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Get started with conversational form builders'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <AlertMessage variant="error" message={formError} className="animate-in" />
          )}

          {mode === 'login' ? (
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    loginForm.formState.errors.email && 'animate-shake border-destructive'
                  )}
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link
                    to="/password-reset"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={loginForm.watch('rememberMe')}
                  onCheckedChange={(checked) =>
                    loginForm.setValue('rememberMe', checked === true)
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full h-11 auth-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    signupForm.formState.errors.email &&
                      'animate-shake border-destructive'
                  )}
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <TooltipProvider delayDuration={400}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Password requirements"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px]">
                        <p>{PASSWORD_REQUIREMENTS}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <PasswordInput
                  id="signup-password"
                  placeholder="••••••••"
                  error={signupForm.formState.errors.password?.message}
                  className={cn(
                    signupForm.formState.errors.password && 'animate-shake'
                  )}
                  {...signupForm.register('password')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <PasswordInput
                  id="signup-confirm-password"
                  placeholder="••••••••"
                  error={signupForm.formState.errors.confirmPassword?.message}
                  className={cn(
                    signupForm.formState.errors.confirmPassword && 'animate-shake'
                  )}
                  {...signupForm.register('confirmPassword')}
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="acceptTerms"
                  checked={signupForm.watch('acceptTerms')}
                  onCheckedChange={(checked) =>
                    signupForm.setValue('acceptTerms', checked === true)
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {signupForm.formState.errors.acceptTerms && (
                <p className="text-sm text-destructive -mt-2">
                  {signupForm.formState.errors.acceptTerms.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-11 auth-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground pt-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={handleModeSwitch}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <TooltipProvider delayDuration={400}>
            <div className="grid grid-cols-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <OAuthButton
                      provider="google"
                      onClick={() => handleOAuth('google')}
                      disabled={isSubmitting}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in with your Google account</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <OAuthButton
                      provider="microsoft"
                      onClick={() => handleOAuth('microsoft')}
                      disabled={isSubmitting}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in with your Microsoft account</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <OAuthButton
                      provider="github"
                      onClick={() => handleOAuth('github')}
                      disabled={isSubmitting}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in with your GitHub account</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <SSOButton
            onClick={handleEnterpriseLogin}
            disabled={isSubmitting}
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
