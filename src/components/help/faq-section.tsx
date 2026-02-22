import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useFAQs } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'

export function FAQSection() {
  const { data, isLoading, error } = useFAQs()

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No FAQs available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-2">Frequently asked questions</h2>
        <p className="text-muted-foreground text-sm">
          Find answers to common questions about AgentForm.
        </p>
      </div>

      <Accordion type="single" defaultValue={data[0]?.id.toString()}>
        {data.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id.toString()}>
            <AccordionTrigger value={faq.id.toString()} className="font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent value={faq.id.toString()}>
              <p>{faq.answer}</p>
              {faq.related_links?.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {faq.related_links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
