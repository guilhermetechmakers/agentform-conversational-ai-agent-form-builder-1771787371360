import { useParams } from 'react-router-dom'
import { useSession } from '@/hooks/use-sessions'
import { SessionDetailPane } from '@/components/sessions'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, refetch } = useSession(id ?? null)

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sessions', href: '/dashboard/sessions' },
          {
            label: data ? `Session ${data.id.slice(0, 8)}…` : id ?? 'Session',
          },
        ]}
      />
      <SessionDetailPane session={data} isLoading={isLoading} onRefetch={refetch} />
    </div>
  )
}
