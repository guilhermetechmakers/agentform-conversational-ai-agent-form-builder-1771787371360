import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

const mockAgents = [
  { id: '1', name: 'Lead Capture', status: 'published' as const, sessions: 142, conversion: 68 },
  { id: '2', name: 'Product Feedback', status: 'draft' as const, sessions: 28, conversion: 45 },
]

export function AgentsListPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage your conversational form agents
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/dashboard/agents/new">
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
        </CardHeader>
        <CardContent>
            {mockAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No agents yet</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                  Create your first agent to start collecting data through conversational forms.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/dashboard/agents/new">Create Agent</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mockAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/dashboard/agents/${agent.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{agent.name}</p>
                        <Badge variant={agent.status === 'published' ? 'success' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {agent.sessions} sessions · {agent.conversion}% conversion
                      </p>
                    </div>
                    <div className="w-24">
                      <Progress value={agent.conversion} className="h-2" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
