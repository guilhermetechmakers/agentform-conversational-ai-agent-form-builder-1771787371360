import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionContextValue {
  openItems: Set<string>
  toggle: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = 'single', defaultValue, children, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
      const initial = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
      return new Set(initial)
    })

    const toggle = React.useCallback(
      (value: string) => {
        setOpenItems((prev) => {
          const next = new Set(prev)
          if (next.has(value)) {
            next.delete(value)
          } else {
            if (type === 'single') next.clear()
            next.add(value)
          }
          return next
        })
      },
      [type]
    )

    return (
      <AccordionContext.Provider value={{ openItems, toggle }}>
        <div ref={ref} className={cn('space-y-1', className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = 'Accordion'

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => (
    <div ref={ref} className={cn('border-b border-border', className)} data-value={value} {...props}>
      {children}
    </div>
  )
)
AccordionItem.displayName = 'AccordionItem'

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext)
    const isOpen = ctx?.openItems.has(value) ?? false

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex w-full items-center justify-between py-4 text-left font-semibold transition-all duration-200 hover:text-foreground [&[data-state=open]>svg]:rotate-180',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => ctx?.toggle(value)}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>
    )
  }
)
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext)
  const isOpen = ctx?.openItems.has(value) ?? false

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden transition-all duration-200 ease-in-out',
        isOpen ? 'max-h-[800px]' : 'max-h-0'
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      <div className={cn('pb-4 pt-0 text-muted-foreground', className)}>{children}</div>
    </div>
  )
})
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
