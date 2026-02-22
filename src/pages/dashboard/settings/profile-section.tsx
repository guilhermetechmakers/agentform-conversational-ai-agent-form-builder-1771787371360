import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AvatarUploader, NotificationSettings, AccountManagement } from '@/components/profile'
import {
  useUserProfile,
  useUpdateProfile,
  useNotificationPreferences,
  useAvatarUpload,
  useDeleteAccount,
} from '@/hooks/use-settings'
import { TIMEZONES } from '@/lib/timezones'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
})

type ProfileForm = z.infer<typeof profileSchema>

function getDisplayName(data: { first_name?: string; last_name?: string; name?: string }): string {
  if (data.first_name && data.last_name) {
    return `${data.first_name} ${data.last_name}`.trim()
  }
  return data.name ?? ''
}

export function ProfileSection() {
  const { data, isLoading, error, refetch } = useUserProfile()
  const { update, isLoading: isUpdating } = useUpdateProfile()
  const { data: prefs, isLoading: prefsLoading, refetch: refetchPrefs, update: updatePrefs } = useNotificationPreferences()
  const { upload, remove } = useAvatarUpload()
  const { deleteAccount } = useDeleteAccount()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: data?.first_name ?? data?.name?.split(' ')[0] ?? '',
      last_name: data?.last_name ?? data?.name?.split(' ').slice(1).join(' ') ?? '',
      timezone: data?.timezone ?? 'America/New_York',
    },
  })

  useEffect(() => {
    if (data) {
      const firstName = data.first_name ?? data.name?.split(' ')[0] ?? ''
      const lastName = data.last_name ?? data.name?.split(' ').slice(1).join(' ') ?? ''
      form.reset({
        first_name: firstName,
        last_name: lastName,
        timezone: data.timezone,
      })
    }
  }, [data, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    await update({
      first_name: values.first_name,
      last_name: values.last_name,
      name: `${values.first_name} ${values.last_name}`.trim(),
      timezone: values.timezone,
    })
    refetch()
    setIsEditing(false)
  })

  const handleAvatarUpload = async (file: File) => {
    await upload(file)
    refetch()
  }

  const handleAvatarRemove = async () => {
    await remove()
    refetch()
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive text-center">{error ?? 'Failed to load profile'}</p>
            <Button variant="outline" className="mt-4 mx-auto block" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = getDisplayName(data)

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information, notification preferences, and account settings
        </p>
      </div>

      {/* Profile Information */}
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your personal details and avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-8">
            <AvatarUploader
              avatarUrl={data.avatar_url}
              name={displayName}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            <div className="flex-1 space-y-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...form.register('first_name')}
                        className="transition-colors focus:border-primary"
                      />
                      {form.formState.errors.first_name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...form.register('last_name')}
                        className="transition-colors focus:border-primary"
                      />
                      {form.formState.errors.last_name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={form.watch('timezone')}
                      onValueChange={(v) => form.setValue('timezone', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false)
                        form.reset()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">First Name</p>
                      <p className="font-medium">{data.first_name ?? displayName.split(' ')[0] ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                      <p className="font-medium">{data.last_name ?? displayName.split(' ').slice(1).join(' ') || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{data.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                    <p className="font-medium">{data.timezone}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Edit profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <NotificationSettings
        preferences={prefs}
        isLoading={prefsLoading}
        onFetch={refetchPrefs}
        onUpdate={updatePrefs}
      />

      {/* Account Management */}
      <AccountManagement onDeleteAccount={deleteAccount} />
    </div>
  )
}
