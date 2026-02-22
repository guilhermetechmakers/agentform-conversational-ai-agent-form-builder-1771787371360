import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Plan } from '@/types/billing'
import { createPlan, updatePlan, deletePlan } from '@/api/billing'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quota_sessions: z.coerce.number().min(0, 'Must be 0 or more'),
  quota_tokens: z.coerce.number().min(0, 'Must be 0 or more'),
  price_per_month: z.coerce.number().min(0, 'Must be 0 or more'),
})

type PlanFormValues = z.infer<typeof planSchema>

interface AdminPlanConfigProps {
  plans: Plan[]
  isLoading: boolean
  onRefetch: () => void
}

export function AdminPlanConfig({ plans, isLoading, onRefetch }: AdminPlanConfigProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      quota_sessions: 100,
      quota_tokens: 100000,
      price_per_month: 0,
    },
  })

  const handleCreate = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await createPlan(values)
      toast.success('Plan created successfully')
      setCreateOpen(false)
      form.reset()
      onRefetch()
    } catch {
      toast.error('Failed to create plan')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleUpdate = form.handleSubmit(async (values) => {
    if (!editingPlan) return
    setIsSubmitting(true)
    try {
      await updatePlan(editingPlan.id, values)
      toast.success('Plan updated successfully')
      setEditingPlan(null)
      onRefetch()
    } catch {
      toast.error('Failed to update plan')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await deletePlan(plan.id)
      toast.success('Plan deleted')
      onRefetch()
    } catch {
      toast.error('Failed to delete plan')
    } finally {
      setIsDeleting(false)
    }
  }

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan)
    form.reset({
      name: plan.name,
      quota_sessions: plan.quota_sessions,
      quota_tokens: plan.quota_tokens,
      price_per_month: plan.price_per_month,
    })
  }

  if (isLoading) {
    return (
      <Card className="transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Plan Configuration</CardTitle>
          <CardDescription>Create, edit, and delete subscription plans</CardDescription>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="transition-transform hover:scale-[1.02]">
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Plan</DialogTitle>
              <DialogDescription>Add a new subscription plan with quota and pricing</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Plan name</Label>
                <Input
                  id="create-name"
                  {...form.register('name')}
                  placeholder="e.g. Pro"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-sessions">Sessions quota</Label>
                  <Input
                    id="create-sessions"
                    type="number"
                    {...form.register('quota_sessions')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-tokens">Tokens quota</Label>
                  <Input
                    id="create-tokens"
                    type="number"
                    {...form.register('quota_tokens')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-price">Price per month ($)</Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  {...form.register('price_per_month')}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-semibold">{plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(plan.quota_sessions)} sessions · {formatNumber(plan.quota_tokens)}{' '}
                  tokens · {formatCurrency(plan.price_per_month)}/mo
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(plan)}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan)}
                  disabled={isDeleting}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!editingPlan} onOpenChange={(o) => !o && setEditingPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
              <DialogDescription>Update plan quotas and pricing</DialogDescription>
            </DialogHeader>
            {editingPlan && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan name</Label>
                  <Input {...form.register('name')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sessions quota</Label>
                    <Input type="number" {...form.register('quota_sessions')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tokens quota</Label>
                    <Input type="number" {...form.register('quota_tokens')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price per month ($)</Label>
                  <Input type="number" step="0.01" {...form.register('price_per_month')} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
