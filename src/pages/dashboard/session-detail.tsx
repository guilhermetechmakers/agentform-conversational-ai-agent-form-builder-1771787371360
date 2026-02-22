import { useParams } from 'react-router-dom'
import { useSession } from '@/hooks/use-sessions'
import { SessionDetailPane } from '@/components/sessions'
import { BackButton } from '@/components/navigation'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, refetch } = useSession(id ?? null)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BackButton fallbackTo="/dashboard/sessions" label="Back to Sessions" />
      </div>
      <SessionDetailPane session={data} isLoading={isLoading} onRefetch={refetch} />
    </div>
  )
}
