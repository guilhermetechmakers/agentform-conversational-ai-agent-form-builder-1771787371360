import { Link } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LinkExpiredProps {
  className?: string
}

export function LinkExpired({ className }: LinkExpiredProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-background p-4 animate-fade-in',
        className
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Clock className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        Link expired
      </h1>
      <p className="mt-2 max-w-md text-center text-muted-foreground">
        This agent link has expired and is no longer accessible. Please contact
        the agent owner for a new link.
      </p>
      <Button asChild className="mt-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return home
        </Link>
      </Button>
    </div>
  )
}
