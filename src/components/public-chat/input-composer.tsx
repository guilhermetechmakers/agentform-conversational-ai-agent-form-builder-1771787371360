import { useState, useCallback } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface InputComposerProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function InputComposer({
  onSend,
  disabled,
  placeholder = 'Type your message...',
  className,
}: InputComposerProps) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (!trimmed || disabled) return
      onSend(trimmed)
      setValue('')
    },
    [value, disabled, onSend]
  )

  return (
    <div
      className={cn(
        'sticky bottom-0 border-t border-border bg-card p-4',
        className
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex flex-col gap-2"
      >
        <div className="flex gap-2 items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="shrink-0 h-10 w-10 rounded-lg"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none rounded-xl border-input focus-visible:ring-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="shrink-0 h-10 w-10 rounded-lg"
            aria-label="Insert emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            disabled={!value.trim() || disabled}
            className="shrink-0 h-10 px-4 rounded-xl bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
