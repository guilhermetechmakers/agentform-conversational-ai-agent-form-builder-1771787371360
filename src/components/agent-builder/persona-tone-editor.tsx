import { Bot } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TONE_PRESETS = [
  { value: 'formal', label: 'Formal', preview: 'Thank you for your inquiry. I would be pleased to assist you.' },
  { value: 'friendly', label: 'Friendly', preview: "Hey! I'd love to help you out. What can I do for you?" },
  { value: 'sales-y', label: 'Sales-oriented', preview: "Great choice! Let me show you how this can benefit you." },
] as const

export interface PersonaState {
  name: string
  instructions: string
  tone: 'formal' | 'friendly' | 'sales-y'
}

interface PersonaToneEditorProps {
  persona: PersonaState
  onChange: (updates: Partial<PersonaState>) => void
}

export function PersonaToneEditor({ persona, onChange }: PersonaToneEditorProps) {
  const activeTone = TONE_PRESETS.find((t) => t.value === persona.tone)

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Persona & tone
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define how your agent speaks and behaves in conversations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="persona-name">Assistant name</Label>
          <input
            id="persona-name"
            value={persona.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Support Bot"
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="persona-instructions">Persona instructions</Label>
          <textarea
            id="persona-instructions"
            value={persona.instructions}
            onChange={(e) => onChange({ instructions: e.target.value })}
            placeholder="Describe how the agent should behave. E.g. You are a friendly assistant helping collect information. Be conversational and helpful."
            rows={5}
            className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Tone preset</Label>
          <Select
            value={persona.tone}
            onValueChange={(v) =>
              onChange({ tone: v as PersonaState['tone'] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {TONE_PRESETS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeTone && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Live phrasing preview
            </p>
            <p className="text-sm italic">&ldquo;{activeTone.preview}&rdquo;</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
