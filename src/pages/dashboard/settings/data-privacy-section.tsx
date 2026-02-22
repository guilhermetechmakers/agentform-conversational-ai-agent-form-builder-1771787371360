import { DataPrivacyCard, CompliancePolicyCard } from '@/components/settings'

export function DataPrivacySection() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <CompliancePolicyCard />
      <DataPrivacyCard />
    </div>
  )
}
