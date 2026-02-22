import { useState } from 'react'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface ContextualDoc {
  id: string
  type: 'rich_text' | 'pdf' | 'url'
  content?: string
  question?: string
  answer?: string
}

interface ContextualDocsUploaderProps {
  docs: ContextualDoc[]
  onChange: (docs: ContextualDoc[]) => void
}

export function ContextualDocsUploader({
  docs,
  onChange,
}: ContextualDocsUploaderProps) {
  const [activeTab, setActiveTab] = useState<'rich_text' | 'url' | 'faq'>(
    'rich_text'
  )
  const [faqQuestion, setFaqQuestion] = useState('')
  const [faqAnswer, setFaqAnswer] = useState('')

  const addRichText = () => {
    const newDoc: ContextualDoc = {
      id: crypto.randomUUID(),
      type: 'rich_text',
      content: '',
    }
    onChange([...docs, newDoc])
  }

  const addUrl = () => {
    const newDoc: ContextualDoc = {
      id: crypto.randomUUID(),
      type: 'url',
      content: '',
    }
    onChange([...docs, newDoc])
  }

  const addFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error('Please enter both question and answer')
      return
    }
    const newDoc: ContextualDoc = {
      id: crypto.randomUUID(),
      type: 'rich_text',
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    }
    onChange([...docs, newDoc])
    setFaqQuestion('')
    setFaqAnswer('')
  }

  const updateDoc = (id: string, updates: Partial<ContextualDoc>) => {
    onChange(
      docs.map((d) => (d.id === id ? { ...d, ...updates } : d))
    )
  }

  const removeDoc = (id: string) => {
    onChange(docs.filter((d) => d.id !== id))
  }

  const faqDocs = docs.filter((d) => d.question && d.answer)
  const otherDocs = docs.filter((d) => !d.question || !d.answer)

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contextual docs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add FAQs, product info, or other context for the agent
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 border-b border-border pb-2">
          {(['rich_text', 'url', 'faq'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-primary/20 text-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab === 'rich_text' ? 'Rich text' : tab === 'url' ? 'URL' : 'FAQ'}
            </button>
          ))}
        </div>

        {activeTab === 'rich_text' && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={addRichText}>
              <Plus className="h-4 w-4" />
              Add rich text block
            </Button>
            {otherDocs
              .filter((d) => d.type === 'rich_text' && !d.question)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex gap-2 items-start p-3 rounded-lg border border-border bg-card"
                >
                  <textarea
                    value={doc.content ?? ''}
                    onChange={(e) =>
                      updateDoc(doc.id, { content: e.target.value })
                    }
                    placeholder="Paste or type context here..."
                    rows={4}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDoc(doc.id)}
                    aria-label="Remove"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={addUrl}>
              <Plus className="h-4 w-4" />
              Add URL
            </Button>
            {otherDocs
              .filter((d) => d.type === 'url')
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex gap-2 items-center p-3 rounded-lg border border-border bg-card"
                >
                  <Input
                    value={doc.content ?? ''}
                    onChange={(e) =>
                      updateDoc(doc.id, { content: e.target.value })
                    }
                    placeholder="https://..."
                    type="url"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDoc(doc.id)}
                    aria-label="Remove"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="grid gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What are your opening hours?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Input
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="e.g. We're open 9am–5pm Mon–Fri"
                />
              </div>
              <Button variant="outline" size="sm" onClick={addFaq}>
                <Plus className="h-4 w-4" />
                Add Q&A pair
              </Button>
            </div>
            {faqDocs.length > 0 && (
              <div className="space-y-2">
                <Label>FAQ pairs</Label>
                {faqDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-start gap-2 p-3 rounded-lg border border-border bg-card"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.answer}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDoc(doc.id)}
                      aria-label="Remove"
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {docs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add context to help your agent answer questions accurately
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
