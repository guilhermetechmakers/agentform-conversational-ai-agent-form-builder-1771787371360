import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TypingIndicator } from './typing-indicator'
import { cn } from '@/lib/utils'
import type { MessageWithId } from '@/contexts/chat-context'

interface MessageListProps {
  messages: MessageWithId[]
  isTyping: boolean
  className?: string
}

export function MessageList({
  messages,
  isTyping,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex animate-fade-in-up',
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-[12px] px-4 py-2.5 shadow-card transition-all duration-200 hover:shadow-card-hover',
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={cn(
                  'text-xs mt-1.5',
                  msg.sender === 'user'
                    ? 'text-primary-foreground/80'
                    : 'text-[#687076]'
                )}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} aria-hidden="true" />
      </div>
    </ScrollArea>
  )
}
