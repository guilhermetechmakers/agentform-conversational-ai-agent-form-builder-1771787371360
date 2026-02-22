import { APIKeysCard, WebhooksCard } from '@/components/settings'
import { AgentWebhooksCard } from '@/components/webhooks'

export function APIWebhooksSection() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <APIKeysCard />
      <AgentWebhooksCard />
      <WebhooksCard />
    </div>
  )
}
