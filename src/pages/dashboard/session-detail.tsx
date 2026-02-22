import { useParams } from 'react-router-dom'
import { useSession } from '@/hooks/use-sessions'
import { SessionDetailPane } from '@/components/sessions'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, refetch } = useSession(id ?? null)

  return (
    <div className="space-y-8 animate-fade-in">
      <SessionDetailPane session={data} isLoading={isLoading} onRefetch={refetch} />
    </div>
  )
}
