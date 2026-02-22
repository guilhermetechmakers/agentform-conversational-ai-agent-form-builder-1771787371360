import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_URL = '/a/demo'

export interface HeroSectionProps {
  onVisitorLog?: () => void
}

export function HeroSection({ onVisitorLog }: HeroSectionProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FFE066]/20 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#E6F4FF]/30 blur-3xl animate-pulse-soft" />
      </div>

      <nav className="flex items-center justify-between px-6 py-6 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2" aria-label="AgentForm home">
          <div className="h-10 w-10 rounded-xl bg-[#FFE066] flex items-center justify-center">
            <Bot className="h-6 w-6 text-[#191A1D]" />
          </div>
          <span className="font-bold text-xl text-[#191A1D]">AgentForm</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <button
              type="button"
              className="text-sm font-medium text-[#687076] hover:text-[#191A1D] transition-colors"
            >
              Sign in
            </button>
          </Link>
          <Link to="/login">
            <button
              type="button"
              className="cta-primary"
              onClick={onVisitorLog}
              aria-label="Create your first agent"
            >
              Create Agent
            </button>
          </Link>
        </div>
      </nav>

      <section className="px-6 py-20 md:py-32 md:px-8 max-w-7xl mx-auto text-center">
        <h1
          className={cn(
            'text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto',
            'text-[#191A1D] animate-fade-in-up'
          )}
          style={{ animationDelay: '0s' }}
        >
          Conversational forms that convert
        </h1>
        <p
          className={cn(
            'mt-6 text-lg md:text-xl max-w-2xl mx-auto font-medium',
            'text-[#687076] animate-fade-in-up'
          )}
          style={{ animationDelay: '0.1s' }}
        >
          Build AI agents that collect structured data through natural chat. Share via public links.
          No code required.
        </p>
        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <Link to="/login" onClick={onVisitorLog}>
            <button type="button" className="cta-primary" aria-label="Create Agent">
              Create Agent
            </button>
          </Link>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-secondary inline-flex items-center justify-center"
            onClick={onVisitorLog}
            aria-label="View live demo in new tab"
          >
            View Demo
          </a>
        </div>
        <p className="mt-6 text-sm text-[#687076] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Or try our{' '}
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFE066] underline-offset-2 hover:underline font-medium"
            onClick={onVisitorLog}
          >
            live demo
          </a>{' '}
          in a new tab.
        </p>
      </section>
    </header>
  )
}
