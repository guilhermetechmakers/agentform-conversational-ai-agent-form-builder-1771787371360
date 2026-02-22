import { RoleManagement, AuditLogsTable, ComplianceToggles } from '@/components/admin'

export function AdminSecurityCompliancePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Security & Compliance</h1>
        <p className="text-[#687076] mt-1">
          RBAC, audit logs, and compliance settings
        </p>
      </div>

      <div className="space-y-8">
        <RoleManagement />
        <AuditLogsTable />
        <ComplianceToggles />
      </div>
    </div>
  )
}
