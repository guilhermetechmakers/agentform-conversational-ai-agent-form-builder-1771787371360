import { useState } from 'react'
import { Search, MessageSquare, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const mockSessions = [
  { id: '1', agentName: 'Lead Capture', status: 'completed' as const, createdAt: '2025-02-22T10:30:00Z', fieldsCount: 3 },
  { id: '2', agentName: 'Lead Capture', status: 'active' as const, createdAt: '2025-02-22T09:15:00Z', fieldsCount: 1 },
  { id: '3', agentName: 'Product Feedback', status: 'completed' as const, createdAt: '2025-02-21T14:00:00Z', fieldsCount: 5 },
]

export function SessionsListPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Review transcripts and extracted data from your agent conversations
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {mockSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No sessions yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Sessions will appear here when visitors interact with your published agents.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Agent</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Fields</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">{session.agentName}</td>
                      <td className="py-3 px-4">
                        <Badge variant={session.status === 'completed' ? 'success' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{session.fieldsCount}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" disabled>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
