import { Link } from 'react-router-dom'
import { Bot, MessageSquare, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
const mockAgents = [
  {
    id: '1',
    name: 'Lead Capture',
    avatarUrl: undefined,
    status: 'published' as const,
    sessions: 142,
    conversion: 68,
  },
  {
    id: '2',
    name: 'Product Feedback',
    avatarUrl: undefined,
    status: 'draft' as const,
    sessions: 28,
    conversion: 45,
  },
]

const stats = [
  { label: 'Total Agents', value: '2', icon: Bot, trend: null },
  { label: 'Sessions (30d)', value: '170', icon: MessageSquare, trend: '+12%' },
  { label: 'Avg. Conversion', value: '56%', icon: TrendingUp, trend: '+5%' },
]

export function DashboardOverviewPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Manage your conversational agents and monitor performance
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-accent-foreground">{stat.trend}</span> from last period
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Agents list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Agents</CardTitle>
          <Button asChild>
            <Link to="/dashboard/agents/new">
              <Plus className="h-4 w-4" />
              Create Agent
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {mockAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No agents yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Create your first conversational agent to start collecting structured data through chat.
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
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
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
