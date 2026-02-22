import { Link } from 'react-router-dom'
import { Bot, Book, MessageCircle, FileQuestion, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    q: 'How do I create my first agent?',
    a: 'Go to Dashboard → Create Agent. Define fields, set persona instructions, and publish to get a public link.',
  },
  {
    q: 'Can I customize the chat appearance?',
    a: 'Yes. In the Agent Builder, use the Appearance tab to set colors and branding.',
  },
  {
    q: 'How are sessions stored?',
    a: 'Each conversation is saved as a session with full transcript and extracted structured data. Export or use webhooks to integrate.',
  },
]

export function HelpPage() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">AgentForm</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="ghost">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Help & Documentation</h1>
        <p className="text-muted-foreground mb-12">
          Get started, explore features, and find answers.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <Card className="hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <Book className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Getting started</CardTitle>
              <CardContent className="p-0 pt-2">
                <p className="text-muted-foreground text-sm">
                  Learn the basics: creating agents, defining fields, and publishing.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  Read guide →
                </Button>
              </CardContent>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <FileQuestion className="h-10 w-10 text-primary mb-2" />
              <CardTitle>FAQs</CardTitle>
              <CardContent className="p-0 pt-2">
                <p className="text-muted-foreground text-sm">
                  Common questions about agents, sessions, and integrations.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View FAQs →
                </Button>
              </CardContent>
            </CardHeader>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Frequently asked questions</h2>
        <div className="space-y-4 mb-16">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardHeader>
                <CardTitle className="text-base">{faq.q}</CardTitle>
                <CardContent className="p-0 pt-2">
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-12 w-12 text-primary" />
              <div>
                <h3 className="font-semibold">Need more help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team for personalized assistance.
                </p>
              </div>
            </div>
            <Button>Contact support</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
