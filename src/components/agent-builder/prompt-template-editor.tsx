import { FileCode2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface PromptTemplateState {
  personaBlock?: string
  groundingContext?: string
  fieldExtractionInstructions?: string
  /** Greeting message template. Placeholder: {{agentName}} */
  greetingTemplate?: string
}

interface PromptTemplateEditorProps {
  template: PromptTemplateState
  onChange: (updates: Partial<PromptTemplateState>) => void
  className?: string
}

const DEFAULT_PERSONA = `You are a friendly assistant. Follow the persona instructions and tone defined for this agent.`
const DEFAULT_GROUNDING = `Use the following context to inform your responses. Do not make up information not in the context.`
const DEFAULT_FIELD_EXTRACTION = `Extract structured field values from user messages when possible. Validate against field types (email, phone, etc.) and ask for clarification if invalid.`
const DEFAULT_GREETING = `Hi! I'm {{agentName}}. I'll help you provide the information we need. Let's get started!`

export function PromptTemplateEditor({
  template,
  onChange,
  className,
}: PromptTemplateEditorProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode2 className="h-5 w-5" />
          Prompt templates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize how the LLM is prompted. These components are combined into
          the final system prompt for each request.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="persona-block">Persona block</Label>
          <Textarea
            id="persona-block"
            value={template.personaBlock ?? ''}
            onChange={(e) =>
              onChange({ personaBlock: e.target.value || undefined })
            }
            placeholder={DEFAULT_PERSONA}
            rows={3}
            className="font-mono text-sm resize-y min-h-[80px] focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="text-xs text-muted-foreground">
            Instructions for persona and tone. Leave empty to use default.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grounding-context">Grounding context</Label>
          <Textarea
            id="grounding-context"
            value={template.groundingContext ?? ''}
            onChange={(e) =>
              onChange({ groundingContext: e.target.value || undefined })
            }
            placeholder={DEFAULT_GROUNDING}
            rows={3}
            className="font-mono text-sm resize-y min-h-[80px] focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="text-xs text-muted-foreground">
            Instructions for using contextual documents. Recent messages are
            appended automatically.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-extraction">Field extraction instructions</Label>
          <Textarea
            id="field-extraction"
            value={template.fieldExtractionInstructions ?? ''}
            onChange={(e) =>
              onChange({
                fieldExtractionInstructions: e.target.value || undefined,
              })
            }
            placeholder={DEFAULT_FIELD_EXTRACTION}
            rows={4}
            className="font-mono text-sm resize-y min-h-[100px] focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="text-xs text-muted-foreground">
            How to extract and validate field values from user messages.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting-template">Greeting template</Label>
          <Textarea
            id="greeting-template"
            value={template.greetingTemplate ?? ''}
            onChange={(e) =>
              onChange({ greetingTemplate: e.target.value || undefined })
            }
            placeholder={DEFAULT_GREETING}
            rows={2}
            className="font-mono text-sm resize-y min-h-[60px] focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="text-xs text-muted-foreground">
            Placeholder: {'{{agentName}}'} — used when starting a new session.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
