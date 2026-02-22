import { memo, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactSupportModal } from '@/components/errors'
import { cn } from '@/lib/utils'

function ErrorMessage() {
  return (
    <h1
      className="text-2xl font-bold text-[#FF5A5F] text-center"
      style={{ fontSize: '24px' }}
    >
      We&apos;re sorry, something went wrong.
    </h1>
  )
}

function RetryButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-[8px] bg-[#FF5A5F] text-white font-bold px-4 py-4 text-base',
        'hover:bg-[#FF5A5F]/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'transition-all duration-200'
      )}
    >
      <RefreshCw className="h-4 w-4" aria-hidden />
      Try Again
    </Button>
  )
}

function ContactSupportLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-base font-medium text-[#191A1D] underline hover:text-[#191A1D]/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
    >
      Contact Support
    </button>
  )
}

function ServerErrorPageComponent() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleRetry = useCallback(() => {
    setIsRetrying(true)
    window.location.reload()
  }, [])

  const handleContactSupport = useCallback(() => {
    setModalOpen(true)
  }, [])

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center px-4 py-8',
        'animate-fade-in'
      )}
      style={{ backgroundColor: '#F7F8FA' }}
    >
      <div className="flex flex-col items-center gap-8 max-w-md w-full p-8">
        <ErrorMessage />
        <div className="flex flex-col items-center gap-8">
          <RetryButton onClick={handleRetry} disabled={isRetrying} />
          <ContactSupportLink onClick={handleContactSupport} />
        </div>
      </div>

      <ContactSupportModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

export const ServerErrorPage = memo(ServerErrorPageComponent)
