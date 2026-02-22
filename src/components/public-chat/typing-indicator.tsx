import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex justify-start animate-in',
        className
      )}
    >
      <div className="max-w-[80%] rounded-[12px] px-4 py-2.5 bg-[rgb(var(--chat-agent))] border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <span className="inline-flex gap-1 items-center">
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot"
            style={{ animationDelay: '200ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot"
            style={{ animationDelay: '400ms' }}
          />
        </span>
      </div>
    </div>
  )
}
