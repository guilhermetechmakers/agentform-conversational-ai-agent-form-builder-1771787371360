import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { LandingPage } from '@/pages/landing'
import { LoginSignupPage } from '@/pages/auth/login-signup'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { DashboardOverviewPage } from '@/pages/dashboard/overview'
import { AgentsListPage } from '@/pages/dashboard/agents-list'
import { AgentBuilderPage } from '@/pages/dashboard/agent-builder'
import { SessionsListPage } from '@/pages/dashboard/sessions-list'
import { SettingsPage } from '@/pages/dashboard/settings'
import { PublicChatPage } from '@/pages/public-chat'
import { HelpPage } from '@/pages/help'
import { PrivacyPolicyPage } from '@/pages/legal/privacy'
import { TermsOfServicePage } from '@/pages/legal/terms'
import { NotFoundPage } from '@/pages/errors/not-found'
import { ServerErrorPage } from '@/pages/errors/server-error'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginSignupPage /> },
  { path: '/password-reset', element: <PasswordResetPage /> },
  { path: '/verify-email', element: <EmailVerificationPage /> },
  {
    path: '/dashboard',
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
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '/a/:publicId', element: <PublicChatPage /> },
  { path: '/help', element: <HelpPage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfServicePage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
