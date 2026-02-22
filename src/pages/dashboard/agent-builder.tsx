import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Bot,
  Save,
  Send,
  Copy,
  Trash2,
  MessageSquare,
  FileText,
  Settings,
  Play,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import {
  AgentMetaPanel,
  AgentSidebar,
  FieldsDesigner,
  PersonaToneEditor,
  ContextualDocsUploader,
  TestConsole,
  PublishSettings,
} from '@/components/agent-builder'
import type { AgentMetaState, PersonaState, PublishSettingsState } from '@/components/agent-builder'
import type { ContextualDoc } from '@/components/agent-builder'
import type { AgentField, ConditionalRule } from '@/types'
import * as agentsApi from '@/api/agents'
import type { AgentDetailResponse } from '@/api/agents'

const SIDEBAR_SECTIONS = [
  { id: 'meta', label: 'Agent meta', icon: Bot },
  { id: 'fields', label: 'Fields', icon: MessageSquare },
  { id: 'persona', label: 'Persona & tone', icon: Bot },
  { id: 'docs', label: 'Contextual docs', icon: FileText },
  { id: 'test', label: 'Test console', icon: Play },
  { id: 'publish', label: 'Publish settings', icon: Settings },
] as const

type SectionId = (typeof SIDEBAR_SECTIONS)[number]['id']

function mapApiToMeta(res: AgentDetailResponse): AgentMetaState {
  return {
    name: res.name ?? '',
    description: res.description ?? '',
    avatar_url: res.avatar_url,
    appearance: res.appearance,
    status: res.status ?? 'draft',
    url_token: res.url_token,
  }
}

const VALID_OPERATORS: ConditionalRule['operator'][] = [
  'equals',
  'not_equals',
  'contains',
  'empty',
]

function mapConditionalRules(
  raw?: Array<{ fieldId: string; operator: string; value?: string }>
): ConditionalRule[] | undefined {
  if (!raw?.length) return undefined
  return raw.map((r) => ({
    fieldId: r.fieldId,
    operator: VALID_OPERATORS.includes(r.operator as ConditionalRule['operator'])
      ? (r.operator as ConditionalRule['operator'])
      : 'equals',
    value: r.value,
  }))
}

function mapApiToFields(res: AgentDetailResponse): AgentField[] {
  const raw = res.fields ?? []
  return raw
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({
      id: f.id ?? crypto.randomUUID(),
      type: (f.type as AgentField['type']) ?? 'text',
      label: f.label ?? '',
      placeholder: f.placeholder,
      default_value: f.default_value,
      validations: f.validation_rules,
      required: f.required,
      conditionalRules: mapConditionalRules(f.conditional_logic),
      order: f.order ?? 0,
      options: f.options,
    }))
}

function mapApiToPersona(res: AgentDetailResponse): PersonaState {
  const p = res.persona
  return {
    name: p?.name ?? '',
    instructions: p?.instructions ?? 'You are a friendly assistant helping collect information. Be conversational and helpful.',
    tone: (p?.tone as PersonaState['tone']) ?? 'friendly',
  }
}

function mapApiToPublishSettings(res: AgentDetailResponse): PublishSettingsState {
  const s = res.publish_settings
  return {
    url_token: s?.url_token ?? res.url_token,
    expiry: s?.expiry,
    password: s?.password,
    webhook_url: s?.webhook_url,
    webhook_headers: s?.webhook_headers,
  }
}

function mapApiToContextualDocs(res: AgentDetailResponse): ContextualDoc[] {
  const docs = res.contextual_docs ?? []
  return docs.map((d) => ({
    id: d.id,
    type: (d.type as ContextualDoc['type']) ?? 'rich_text',
    content: d.content,
  }))
}

export function AgentBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const [activeSection, setActiveSection] = useState<SectionId>('meta')
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [meta, setMeta] = useState<AgentMetaState>({
    name: '',
    description: '',
    status: 'draft',
  })
  const [fields, setFields] = useState<AgentField[]>([])
  const [persona, setPersona] = useState<PersonaState>({
    name: '',
    instructions: 'You are a friendly assistant helping collect information. Be conversational and helpful.',
    tone: 'friendly',
  })
  const [docs, setDocs] = useState<ContextualDoc[]>([])
  const [publishSettings, setPublishSettings] = useState<PublishSettingsState>({})

  const loadAgent = useCallback(async (agentId: string) => {
    setIsLoading(true)
    try {
      const res = await agentsApi.fetchAgent(agentId)
      setMeta(mapApiToMeta(res))
      setFields(mapApiToFields(res))
      setPersona(mapApiToPersona(res))
      setDocs(mapApiToContextualDocs(res))
      setPublishSettings(mapApiToPublishSettings(res))
    } catch {
      toast.error('Failed to load agent')
      navigate('/dashboard/agents')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (!isNew && id) loadAgent(id)
  }, [isNew, id, loadAgent])

  const performSave = useCallback(async () => {
    if (!id || isNew || !meta.name.trim()) return
    setIsSaving(true)
    try {
      await agentsApi.updateAgent(id, {
        name: meta.name.trim(),
        description: meta.description,
        avatar_url: meta.avatar_url,
        appearance: meta.appearance,
        status: meta.status,
      })
      await agentsApi.upsertFields(
        id,
        fields.map((f, i) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          default_value: f.default_value,
          validation_rules: f.validations,
          order: i,
          conditional_logic: f.conditionalRules,
          required: f.required,
          options: f.options,
        }))
      )
      await agentsApi.updatePersona(id, {
        name: persona.name,
        instructions: persona.instructions,
        tone: persona.tone,
      })
      await agentsApi.updatePublishSettings(id, {
        url_token: publishSettings.url_token,
        expiry: publishSettings.expiry,
        password: publishSettings.password,
        webhook_url: publishSettings.webhook_url,
        webhook_headers: publishSettings.webhook_headers,
      })
      setLastSavedAt(new Date())
    } catch {
      toast.error('Autosave failed')
    } finally {
      setIsSaving(false)
    }
  }, [id, isNew, meta, fields, persona, publishSettings])

  useEffect(() => {
    if (isNew || !id) return
    saveTimeoutRef.current = setTimeout(performSave, 2000)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [id, isNew, meta, fields, persona, publishSettings, performSave])

  const handleSave = async () => {
    if (!meta.name.trim()) {
      toast.error('Please enter an agent name')
      return
    }
    setIsSaving(true)
    try {
      if (isNew) {
        const created = await agentsApi.createAgent({
          name: meta.name.trim(),
          avatar_url: meta.avatar_url,
        })
        const agentId = created.id
        await agentsApi.updateAgent(agentId, {
          name: meta.name.trim(),
          description: meta.description,
          avatar_url: meta.avatar_url,
          appearance: meta.appearance,
          status: meta.status,
        })
        if (fields.length > 0) {
        await agentsApi.upsertFields(
          agentId,
          fields.map((f, i) => ({
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            default_value: f.default_value,
            validation_rules: f.validations,
            order: i,
            conditional_logic: f.conditionalRules,
            required: f.required,
            options: f.options,
          }))
        )
        }
        await agentsApi.updatePersona(agentId, {
          name: persona.name,
          instructions: persona.instructions,
          tone: persona.tone,
        })
        await agentsApi.updatePublishSettings(agentId, {
          url_token: publishSettings.url_token,
          expiry: publishSettings.expiry,
          password: publishSettings.password,
          webhook_url: publishSettings.webhook_url,
          webhook_headers: publishSettings.webhook_headers,
        })
        toast.success('Agent created')
        navigate(`/dashboard/agents/${agentId}`)
      } else if (id) {
        await agentsApi.updateAgent(id, {
          name: meta.name.trim(),
          description: meta.description,
          avatar_url: meta.avatar_url,
          appearance: meta.appearance,
          status: meta.status,
        })
        await agentsApi.upsertFields(
          id,
          fields.map((f, i) => ({
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            default_value: f.default_value,
            validation_rules: f.validations,
            order: i,
            conditional_logic: f.conditionalRules,
            required: f.required,
            options: f.options,
          }))
        )
        await agentsApi.updatePersona(id, {
          name: persona.name,
          instructions: persona.instructions,
          tone: persona.tone,
        })
        await agentsApi.updatePublishSettings(id, {
          url_token: publishSettings.url_token,
          expiry: publishSettings.expiry,
          password: publishSettings.password,
          webhook_url: publishSettings.webhook_url,
          webhook_headers: publishSettings.webhook_headers,
        })
        toast.success('Agent saved')
        setLastSavedAt(new Date())
      }
    } catch {
      toast.error('Failed to save agent')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setMeta((m) => ({ ...m, status: 'published' }))
    await handleSave()
  }

  const handleUnpublish = async () => {
    setMeta((m) => ({ ...m, status: 'unpublished' }))
    await handleSave()
  }

  const handleDuplicate = async () => {
    if (!id) return
    try {
      const dup = await agentsApi.duplicateAgent(id)
      toast.success('Agent duplicated')
      navigate(`/dashboard/agents/${dup.id}`)
    } catch {
      toast.error('Failed to duplicate agent')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await agentsApi.deleteAgent(id)
      toast.success('Agent deleted')
      navigate('/dashboard/agents')
    } catch {
      toast.error('Failed to delete agent')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
            <div className="h-48 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Agents Overview', href: '/dashboard/agents' },
    { label: isNew ? 'Create Agent' : meta.name || 'Edit Agent' },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      <AgentSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex flex-col gap-4 p-4 border-b border-border bg-card shrink-0">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/agents')}
                aria-label="Back to agents"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isNew ? 'Create Agent' : 'Edit Agent'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Define fields, persona, and publish settings
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isNew && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : lastSavedAt ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span>
                        Saved {lastSavedAt.toLocaleTimeString()}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          {meta.status === 'published' ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={isSaving}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={isSaving}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              Publish
            </Button>
          )}
          {!isNew && (
            <>
              <Button variant="outline" onClick={handleDuplicate} disabled={isSaving}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Section navigation */}
          <aside className="w-56 shrink-0 border-r border-border bg-card hidden lg:block">
            <ScrollArea className="h-full">
              <nav className="p-3 space-y-1">
                {SIDEBAR_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      activeSection === id
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6 space-y-6">
          {activeSection === 'meta' && (
            <AgentMetaPanel
              meta={meta}
              onChange={(u) => setMeta((m) => ({ ...m, ...u }))}
              isNew={isNew}
            />
          )}
          {activeSection === 'fields' && (
            <FieldsDesigner fields={fields} onFieldsChange={setFields} />
          )}
          {activeSection === 'persona' && (
            <PersonaToneEditor
              persona={persona}
              onChange={(u) => setPersona((p) => ({ ...p, ...u }))}
            />
          )}
          {activeSection === 'docs' && (
            <ContextualDocsUploader docs={docs} onChange={setDocs} />
          )}
          {activeSection === 'test' && (
            <TestConsole
              agentName={meta.name || persona.name}
              avatarUrl={meta.avatar_url}
              fields={fields}
              personaInstructions={persona.instructions}
            />
          )}
          {activeSection === 'publish' && (
            <PublishSettings
              settings={publishSettings}
              onChange={(u) => setPublishSettings((s) => ({ ...s, ...u }))}
              agentId={id}
              isNew={isNew}
            />
          )}
        </main>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Delete agent?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All sessions and data for this agent
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
