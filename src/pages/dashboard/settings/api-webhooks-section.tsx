import { APIKeysCard, WebhooksCard } from '@/components/settings'

export function APIWebhooksSection() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <APIKeysCard />
      <WebhooksCard />
    </div>
  )
}
