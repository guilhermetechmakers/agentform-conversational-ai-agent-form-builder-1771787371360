import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Shield, CreditCard, Webhook } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as Tabs from '@radix-ui/react-tabs'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function SettingsPage() {
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: 'Demo User', email: 'user@example.com' },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, team, billing, and integrations
        </p>
      </div>

      <Tabs.Root defaultValue="profile">
        <Tabs.List className="flex gap-2 border-b border-border mb-6">
          <Tabs.Trigger
            value="profile"
            className="px-4 py-2 rounded-t-lg text-sm font-medium data-[state=active]:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <User className="h-4 w-4 mr-2 inline" />
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger
            value="team"
            className="px-4 py-2 rounded-t-lg text-sm font-medium data-[state=active]:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Team
          </Tabs.Trigger>
          <Tabs.Trigger
            value="billing"
            className="px-4 py-2 rounded-t-lg text-sm font-medium data-[state=active]:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <CreditCard className="h-4 w-4 mr-2 inline" />
            Billing
          </Tabs.Trigger>
          <Tabs.Trigger
            value="integrations"
            className="px-4 py-2 rounded-t-lg text-sm font-medium data-[state=active]:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Webhook className="h-4 w-4 mr-2 inline" />
            API & Webhooks
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account profile</CardTitle>
              <CardDescription>Update your name and email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(() => {})} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit">Save changes</Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team management</CardTitle>
              <CardDescription>Invite members and manage roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Team features and SSO are available on enterprise plans.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Invite member
              </Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & plans</CardTitle>
              <CardDescription>Manage your subscription and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                You are on the Free plan. Upgrade for more sessions and features.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Upgrade plan
              </Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhooks</CardTitle>
              <CardDescription>Configure webhooks and API access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Webhook URLs are configured per agent in the Agent Builder.
              </p>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
