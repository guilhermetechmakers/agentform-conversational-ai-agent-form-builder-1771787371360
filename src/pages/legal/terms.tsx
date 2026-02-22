import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">AgentForm</span>
          </Link>
          <Link to="/">
            <Button variant="ghost">Back to home</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: February 2025</p>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Account rules</h2>
            <p>
              You must provide accurate information and maintain the security of your account.
              You are responsible for all activity under your account.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Payments</h2>
            <p>
              Paid plans are billed via Stripe. Refunds follow our refund policy.
              Usage over quota may incur additional charges.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Prohibited content</h2>
            <p>
              You may not use AgentForm for illegal, harmful, or abusive purposes.
              We reserve the right to suspend accounts that violate these terms.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Versioning</h2>
            <p>
              We may update these terms. Material changes will be communicated via email.
              Continued use constitutes acceptance.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
