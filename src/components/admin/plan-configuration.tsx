import { Settings2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Plan } from '@/types/billing'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quota_sessions: z.coerce.number().min(0),
  quota_tokens: z.coerce.number().min(0),
  price_per_month: z.coerce.number().min(0),
})

type PlanForm = z.infer<typeof planSchema>

interface PlanConfigurationProps {
  plans: Plan[]
  isLoading: boolean
  onCreatePlan?: (data: PlanForm) => Promise<void>
  onUpdatePlan?: (id: string, data: PlanForm) => Promise<void>
  onDeletePlan?: (id: string) => Promise<void>
}

export function PlanConfiguration({
  plans,
  isLoading,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
}: PlanConfigurationProps) {
  const [open, setOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      quota_sessions: 0,
      quota_tokens: 0,
      price_per_month: 0,
    },
  })

  const handleOpenCreate = () => {
    setEditingPlan(null)
    form.reset({ name: '', quota_sessions: 0, quota_tokens: 0, price_per_month: 0 })
    setOpen(true)
  }

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan)
    form.reset({
      name: plan.name,
      quota_sessions: plan.quota_sessions,
      quota_tokens: plan.quota_tokens,
      price_per_month: plan.price_per_month,
    })
    setOpen(true)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (editingPlan) {
        await onUpdatePlan?.(editingPlan.id, values)
        toast.success('Plan updated')
      } else {
        await onCreatePlan?.(values)
        toast.success('Plan created')
      }
      setOpen(false)
    } catch {
      // toast handled by caller
    }
  })

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return
    try {
      await onDeletePlan?.(id)
      toast.success('Plan deleted')
      setOpen(false)
    } catch {
      // toast handled by caller
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-xl border-border transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-xl border-border transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Plan Configuration
            </CardTitle>
            <CardDescription>
              Create, edit, or delete subscription plans
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="transition-transform hover:scale-[1.02]"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add plan
          </Button>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Settings2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">No plans configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first subscription plan
              </p>
              <Button className="mt-4" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-border p-4 transition-all hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="mt-1 text-lg font-bold">
                        {formatCurrency(plan.price_per_month)}/mo
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.quota_sessions.toLocaleString()} sessions · {plan.quota_tokens.toLocaleString()} tokens
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit plan' : 'Create plan'}</DialogTitle>
            <DialogDescription>
              Set quota limits and pricing for this plan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan name</Label>
              <Input id="name" {...form.register('name')} placeholder="e.g. Pro" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quota_sessions">Sessions quota</Label>
                <Input
                  id="quota_sessions"
                  type="number"
                  {...form.register('quota_sessions')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota_tokens">Tokens quota</Label>
                <Input
                  id="quota_tokens"
                  type="number"
                  {...form.register('quota_tokens')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_month">Price per month ($)</Label>
              <Input
                id="price_per_month"
                type="number"
                step="0.01"
                {...form.register('price_per_month')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
