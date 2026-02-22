import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bot, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/api'

/**
 * Handles OAuth callback redirect from backend.
 * Expects URL params: token (or accessToken), refreshToken, user (JSON).
 * Stores tokens and redirects to dashboard.
 */
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token') ?? searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const userJson = searchParams.get('user')

    if (token) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
        if (userJson) {
          try {
            JSON.parse(decodeURIComponent(userJson))
          } catch {
            // Ignore user parse errors
          }
        }
        window.dispatchEvent(new Event('auth-tokens-stored'))
        toast.success('Signed in successfully')
        navigate('/dashboard', { replace: true })
        return
      } catch {
        queueMicrotask(() => setError('Failed to complete sign-in'))
      }
    } else if (searchParams.get('error')) {
      queueMicrotask(() =>
        setError(
          searchParams.get('error_description') ??
            searchParams.get('error') ??
            'Authentication failed'
        )
      )
    } else {
      queueMicrotask(() => setError('Invalid callback: no token received'))
    }
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-6">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader>
            <Link to="/" className="flex justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
            </Link>
            <CardTitle className="text-[#191A1D]">Sign-in failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-6">
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Completing sign-in...</p>
        </CardContent>
      </Card>
    </div>
  )
}
