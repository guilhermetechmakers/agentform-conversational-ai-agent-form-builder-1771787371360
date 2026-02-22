import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Home, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ServerErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-destructive">500</h1>
        <h2 className="text-2xl font-semibold mt-4">Something went wrong</h2>
        <p className="text-muted-foreground mt-2">
          We're sorry. An unexpected error occurred. Our team has been notified.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/help" className="text-primary hover:underline flex items-center justify-center gap-1">
            <MessageCircle className="h-4 w-4" />
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
