import { Link, useSearchParams } from 'react-router-dom'
import { Bot, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const error = searchParams.get('error')
  const isSuccess = !error && token

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
            {isSuccess ? 'Email verified' : 'Verification failed'}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? 'Your email has been verified. You can now access your dashboard.'
              : error ?? 'The verification link may have expired or is invalid.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {isSuccess ? (
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-accent-foreground" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {isSuccess && (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
            {!isSuccess && (
              <Button asChild variant="outline">
                <Link to="/login">Back to sign in</Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
