import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: February 2025</p>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Data we collect</h2>
            <p>
              We collect account data (email, name), usage data (sessions, agent configurations),
              and conversation data (transcripts, extracted fields) when you use AgentForm.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Retention</h2>
            <p>
              Data retention is configurable per account. Default retention is 90 days for sessions.
              You can request export or deletion at any time.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Third-party integrations</h2>
            <p>
              We use Stripe for billing, SendGrid/SES for email, and AWS for storage.
              Webhook payloads are sent to URLs you configure.
            </p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold mt-8 mb-2">Contact</h2>
            <p>
              For privacy inquiries: privacy@agentform.app
            </p>
          </section>
        </div>
        <div className="mt-12">
          <Button variant="outline" disabled>
            Download PDF
          </Button>
        </div>
      </main>
    </div>
  )
}
