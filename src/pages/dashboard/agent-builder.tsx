import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Bot,
  Save,
  Send,
  Settings,
  MessageSquare,
  FileText,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import type { AgentField } from '@/types'

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Text area' },
] as const

export function AgentBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [name, setName] = useState(isNew ? '' : 'Lead Capture')
  const [description, setDescription] = useState('')
  const [personaInstructions, setPersonaInstructions] = useState(
    'You are a friendly assistant helping collect information. Be conversational and helpful.'
  )
  const [fields, setFields] = useState<AgentField[]>([
    { id: '1', type: 'text', label: 'Full Name', required: true, order: 0 },
    { id: '2', type: 'email', label: 'Email', required: true, order: 1 },
    { id: '3', type: 'phone', label: 'Phone', required: false, order: 2 },
  ])
  const [activeTab, setActiveTab] = useState('fields')
  const [isSaving, setIsSaving] = useState(false)

  const addField = () => {
    const newField: AgentField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New field',
      required: false,
      order: fields.length,
    }
    setFields([...fields, newField])
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId))
  }

  const updateField = (fieldId: string, updates: Partial<AgentField>) => {
    setFields(
      fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      navigate('/dashboard/agents')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      navigate('/dashboard/agents')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? 'Create Agent' : 'Edit Agent'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Define fields, persona, and publish settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agent meta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lead Capture"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this agent"
                  />
                </div>
            </CardContent>
          </Card>

          <Card>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <Tabs.List className="flex gap-2 border-b border-border pb-2">
                  <Tabs.Trigger
                    value="fields"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === 'fields'
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 inline" />
                    Fields
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="persona"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === 'persona'
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Bot className="h-4 w-4 mr-2 inline" />
                    Persona
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="docs"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === 'docs'
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <FileText className="h-4 w-4 mr-2 inline" />
                    Docs
                  </Tabs.Trigger>
                </Tabs.List>
              </CardHeader>
              <CardContent>
                <Tabs.Content value="fields" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Drag to reorder. Define the structured data this agent collects.
                      </p>
                      <Button variant="outline" size="sm" onClick={addField}>
                        <Plus className="h-4 w-4" />
                        Add field
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            className="flex-1"
                            placeholder="Field label"
                          />
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(field.id, {
                                type: e.target.value as AgentField['type'],
                              })
                            }
                            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
                          >
                            {fieldTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required ?? false}
                              onChange={(e) =>
                                updateField(field.id, {
                                  required: e.target.checked,
                                })
                              }
                            />
                            Required
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(field.id)}
                            aria-label="Remove field"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.Content>
                <Tabs.Content value="persona" className="mt-0">
                  <div className="space-y-4">
                    <Label>Persona instructions</Label>
                    <textarea
                      value={personaInstructions}
                      onChange={(e) => setPersonaInstructions(e.target.value)}
                      className="w-full min-h-[120px] rounded-lg border border-input bg-card px-3 py-2 text-sm"
                      placeholder="Describe how the agent should behave..."
                    />
                  </div>
                </Tabs.Content>
                <Tabs.Content value="docs" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Upload FAQs, product info, or other context for the agent
                    </p>
                    <Button variant="outline" className="mt-4" disabled>
                      Upload documents (coming soon)
                    </Button>
                  </div>
                </Tabs.Content>
              </CardContent>
            </Tabs.Root>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Publish settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Public URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={isNew ? '' : 'agentform.app/a/abc123'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" disabled>
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Optional password</Label>
                  <Input type="password" placeholder="Leave empty for public" />
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Test in sandbox (coming soon)
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
