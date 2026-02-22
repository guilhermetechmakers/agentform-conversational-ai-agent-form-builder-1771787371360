import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { acknowledgeTerms } from '@/api/terms'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface AcknowledgementLinkProps {
  termsId?: string
  className?: string
}

export function AcknowledgementLink({ termsId, className }: AcknowledgementLinkProps) {
  const { isAuthenticated, user } = useAuth()
  const [isAcknowledging, setIsAcknowledging] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  const handleAcknowledge = async () => {
    if (!isAuthenticated || !user || !termsId) return
    setIsAcknowledging(true)
    try {
      await acknowledgeTerms({ userId: user.id, termsId })
      setHasAcknowledged(true)
      toast.success('Terms of Service acknowledged')
    } catch {
      toast.error('Failed to record acknowledgment. You can still proceed to sign up.')
    } finally {
      setIsAcknowledging(false)
    }
  }

  return (
    <section
      className={cn(
        'rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 shadow-card',
        'animate-fade-in-up',
        className
      )}
      aria-labelledby="acknowledgement-heading"
    >
      <h2
        id="acknowledgement-heading"
        className="text-xl font-bold text-foreground mb-4"
      >
        Accept Terms of Service
      </h2>
      <p className="text-base text-muted-foreground mb-6 leading-relaxed">
        By creating an account, you agree to these Terms of Service and our
        Privacy Policy. If you have not yet created an account, use the link
        below to sign up and indicate your acceptance.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        {isAuthenticated && termsId && !hasAcknowledged ? (
          <Button
            onClick={handleAcknowledge}
            disabled={isAcknowledging}
            className="w-full sm:w-auto"
          >
            {isAcknowledging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                I Accept Terms
              </>
            )}
          </Button>
        ) : null}
        <Button asChild variant={hasAcknowledged ? 'outline' : 'default'}>
          <Link
            to="/login"
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            {hasAcknowledged ? 'Go to Dashboard' : 'Continue to Sign Up'}
          </Link>
        </Button>
      </div>
    </section>
  )
}
