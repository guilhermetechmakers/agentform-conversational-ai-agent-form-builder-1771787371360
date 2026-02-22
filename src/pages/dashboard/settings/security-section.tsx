import { SecurityCard, DataProtectionCard } from '@/components/settings'

export function SecuritySection() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <DataProtectionCard />
      <SecurityCard />
    </div>
  )
}
