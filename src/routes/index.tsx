import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { AdminLayout } from '@/layouts/admin-layout'
import { LandingPage } from '@/pages/landing'
import { PricingPage } from '@/pages/pricing'
import { LoginSignupPage } from '@/pages/auth/login-signup'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { DashboardOverviewPage } from '@/pages/dashboard/overview'
import { AgentsListPage } from '@/pages/dashboard/agents-list'
import { AgentBuilderPage } from '@/pages/dashboard/agent-builder'
import { SessionsListPage } from '@/pages/dashboard/sessions-list'
import { SessionDetailPage } from '@/pages/dashboard/session-detail'
import { SettingsLayout } from '@/pages/dashboard/settings/settings-layout'
import { ProfileSection } from '@/pages/dashboard/settings/profile-section'
import { TeamSection } from '@/pages/dashboard/settings/team-section'
import { BillingSection } from '@/pages/dashboard/settings/billing-section'
import { APIWebhooksSection } from '@/pages/dashboard/settings/api-webhooks-section'
import { SecuritySection } from '@/pages/dashboard/settings/security-section'
import { DataPrivacySection } from '@/pages/dashboard/settings/data-privacy-section'
import { PublicChatPage } from '@/pages/public-chat'
import { HelpPage } from '@/pages/help'
import { HelpLayout } from '@/pages/help/help-layout'
import { KnowledgeBaseSection } from '@/pages/help/knowledge-base-section'
import { GettingStartedSection } from '@/pages/help/getting-started-section'
import { FAQsSection } from '@/pages/help/faqs-section'
import { ContactSection } from '@/pages/help/contact-section'
import { ChangelogSection } from '@/pages/help/changelog-section'
import { PrivacyPolicyPage } from '@/pages/legal/privacy'
import { TermsOfServicePage } from '@/pages/legal/terms'
import { NotFoundPage } from '@/pages/errors/not-found'
import { ServerErrorPage } from '@/pages/errors/server-error'
import {
  AdminOverviewPage,
  AdminUsersPage,
  AdminAgentsPage,
  AdminLogsPage,
  AdminBillingPage,
} from '@/pages/admin'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function RootLayout() {
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'login', element: <LoginSignupPage /> },
      { path: 'password-reset', element: <PasswordResetPage /> },
      { path: 'verify-email', element: <EmailVerificationPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverviewPage /> },
          { path: 'agents', element: <AgentsListPage /> },
          { path: 'agents/new', element: <AgentBuilderPage /> },
          { path: 'agents/:id', element: <AgentBuilderPage /> },
          { path: 'sessions', element: <SessionsListPage /> },
          { path: 'sessions/:id', element: <SessionDetailPage /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard/settings/profile" replace /> },
              { path: 'profile', element: <ProfileSection /> },
              { path: 'team', element: <TeamSection /> },
              { path: 'billing', element: <BillingSection /> },
              { path: 'api-webhooks', element: <APIWebhooksSection /> },
              { path: 'security', element: <SecuritySection /> },
              { path: 'data-privacy', element: <DataPrivacySection /> },
            ],
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'agents', element: <AdminAgentsPage /> },
          { path: 'logs', element: <AdminLogsPage /> },
          { path: 'billing', element: <AdminBillingPage /> },
        ],
      },
      { path: 'a/:publicId', element: <PublicChatPage /> },
      {
        path: 'help',
        element: <HelpPage />,
        children: [
          {
            element: <HelpLayout />,
            children: [
              { index: true, element: <Navigate to="/help/knowledge-base" replace /> },
              { path: 'knowledge-base', element: <KnowledgeBaseSection /> },
              { path: 'getting-started', element: <GettingStartedSection /> },
              { path: 'faqs', element: <FAQsSection /> },
              { path: 'contact', element: <ContactSection /> },
              { path: 'changelog', element: <ChangelogSection /> },
            ],
          },
        ],
      },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsOfServicePage /> },
      { path: '500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
