import { Link } from 'react-router-dom'
import { Bot, MessageSquare, Link2, Zap, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: MessageSquare,
    title: 'Conversational Forms',
    description:
      'Collect structured data through natural chat. Reduce form abandonment and capture richer context.',
  },
  {
    icon: Link2,
    title: 'Public Links',
    description:
      'Share agents via unique URLs. No embedding required. Perfect for campaigns and lead capture.',
  },
  {
    icon: Zap,
    title: 'LLM-Powered',
    description:
      'Smart validation, follow-up questions, and persona control. Enforce schema while feeling human.',
  },
  {
    icon: BarChart3,
    title: 'Sessions & Analytics',
    description:
      'Full transcripts, extracted fields, webhooks, and exports. Integrate with your CRM.',
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description:
      'SSO, RBAC, audit logs, PII redaction, and configurable retention. Built for compliance.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft" />
        </div>
        <nav className="flex items-center justify-between px-4 py-6 md:px-8 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AgentForm</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button>Get started</Button>
            </Link>
          </div>
        </nav>
        <section className="px-4 py-20 md:py-32 md:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto animate-fade-in-up">
            Conversational forms that{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              convert
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Build AI agents that collect structured data through natural chat. Share via public links. No code required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" asChild className="text-base px-8 py-6">
              <Link to="/login">Start building free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
              <Link to="/a/demo">Try live demo</Link>
            </Button>
          </div>
        </section>
      </header>

      {/* Features - Bento-style grid */}
      <section className="px-4 py-20 md:py-32 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Built for modern teams
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Reduce lead-capture friction. Capture richer context. Deploy in minutes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  'transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover',
                  i === 0 && 'md:col-span-2 md:row-span-2'
                )}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:py-32 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your forms?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join marketers, sales teams, and SMBs using AgentForm for higher conversion and richer leads.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">Create your first agent</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold">AgentForm</span>
          </Link>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/help" className="hover:text-foreground">Help</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
