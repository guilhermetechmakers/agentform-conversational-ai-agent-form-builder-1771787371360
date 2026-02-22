import { PublicNavbar } from '@/components/navigation'
import { PolicySection, PrivacyDownloadButton } from '@/components/legal'
import { Footer } from '@/components/landing'
import { cn } from '@/lib/utils'
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_LAST_UPDATED,
} from '@/lib/privacy-content'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <PublicNavbar className="max-w-3xl mx-auto" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 pb-32">
        <h1 className="text-3xl md:text-4xl font-bold text-[#191A1D] mb-2">
          Privacy Policy
        </h1>
        <p className="text-base font-normal text-[#687076] mb-12">
          Last updated: {PRIVACY_POLICY_LAST_UPDATED}
        </p>

        <div className="prose prose-sm max-w-none space-y-12 text-left">
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <PolicySection
              key={section.id}
              section={section}
              className={cn(
                section.id === 'contact' &&
                  'rounded-2xl border-2 border-[#FFE066] bg-[rgb(255,224,102,0.08)] p-6 shadow-card'
              )}
            />
          ))}
        </div>
      </main>

      <PrivacyDownloadButton />

      <div className="pb-24">
        <Footer />
      </div>
    </div>
  )
}
