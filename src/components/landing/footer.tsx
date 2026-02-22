import { Link } from 'react-router-dom'
import { Bot, Twitter, Linkedin, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

const SOCIAL_LINKS = [
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com', icon: Github, label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="border-t border-[#EDEDED] py-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#191A1D] hover:opacity-80 transition-opacity"
          aria-label="AgentForm home"
        >
          <Bot className="h-5 w-5 text-[#FFE066]" />
          <span className="font-semibold">AgentForm</span>
        </Link>
        <nav
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#687076]"
          aria-label="Footer navigation"
        >
          <Link
            to="/pricing"
            className="hover:text-[#191A1D] transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/privacy"
            className="hover:text-[#191A1D] transition-colors"
          >
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-[#191A1D] transition-colors">
            Terms
          </Link>
          <Link to="/help" className="hover:text-[#191A1D] transition-colors">
            Help
          </Link>
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'text-[#687076] hover:text-[#FFE066] transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE066] focus-visible:ring-offset-2 rounded'
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
