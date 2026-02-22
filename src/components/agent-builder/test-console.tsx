import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AgentField } from '@/types'

interface TestMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  validationError?: string
}

interface TestConsoleProps {
  agentName: string
  avatarUrl?: string
  fields: AgentField[]
  personaInstructions?: string
}

export function TestConsole({
  agentName,
  avatarUrl,
  fields,
  personaInstructions,
}: TestConsoleProps) {
  const [messages, setMessages] = useState<TestMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: personaInstructions
        ? `Hi! I'm ${agentName || 'your assistant'}. ${personaInstructions.slice(0, 80)}... What would you like to share?`
        : `Hi! I'm ${agentName || 'your assistant'}. I'll help you provide the information we need. What's your name?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const simulateResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase()
    if (lower.includes('email') || lower.includes('@')) {
      return "Thanks! I've noted your email. What's your phone number?"
    }
    if (lower.includes('phone') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(userInput)) {
      return "Perfect! I have everything I need. Thank you for your time!"
    }
    const firstField = fields[0]
    if (firstField) {
      return `Got it, thanks! What's your ${firstField.label.toLowerCase()}?`
    }
    return "Thanks for that! Is there anything else you'd like to share?"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg: TestMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 600))

    const response = simulateResponse(userMsg.content)
    const assistantMsg: TestMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsTyping(false)
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover flex flex-col h-[480px]">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Test console
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Preview the conversation flow with real-time validation
        </p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="flex-1 flex flex-col border-t border-border">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {agentName?.slice(0, 2).toUpperCase() ?? 'A'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.validationError && (
                      <p className="text-xs text-destructive mt-1">
                        {msg.validationError}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {agentName?.slice(0, 2).toUpperCase() ?? 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted border border-border rounded-2xl px-4 py-2.5">
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-4 border-t border-border"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
