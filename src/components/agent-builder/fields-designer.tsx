import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Trash2,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { AgentField, ConditionalRule } from '@/types'

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'textarea', label: 'Text area' },
] as const

const CONDITIONAL_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'empty', label: 'Is empty' },
] as const

interface SortableFieldItemProps {
  field: AgentField
  allFields: AgentField[]
  onUpdate: (id: string, updates: Partial<AgentField>) => void
  onRemove: (id: string) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function SortableFieldItem({
  field,
  allFields,
  onUpdate,
  onRemove,
  isExpanded,
  onToggleExpand,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const regex = field.validations?.regex as string | undefined
  const setRegex = (value: string) => {
    onUpdate(field.id, {
      validations: {
        ...field.validations,
        regex: value || undefined,
      },
    })
  }

  const addConditionalRule = () => {
    const prevFields = field.conditionalRules ?? []
    const firstOtherField = allFields.find((f) => f.id !== field.id)
    onUpdate(field.id, {
      conditionalRules: [
        ...prevFields,
        {
          fieldId: firstOtherField?.id ?? '',
          operator: 'equals' as const,
          value: '',
        },
      ],
    })
  }

  const updateConditionalRule = (index: number, updates: Partial<ConditionalRule>) => {
    const rules = [...(field.conditionalRules ?? [])]
    rules[index] = { ...rules[index], ...updates }
    onUpdate(field.id, { conditionalRules: rules })
  }

  const removeConditionalRule = (index: number) => {
    const rules = (field.conditionalRules ?? []).filter((_, i) => i !== index)
    onUpdate(field.id, { conditionalRules: rules })
  }

  const otherFields = allFields.filter((f) => f.id !== field.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-border bg-card transition-all duration-200 overflow-hidden',
        isDragging && 'opacity-80 shadow-card-hover z-10'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 -ml-1 rounded"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          placeholder="Field label"
          className="flex-1 min-w-0"
        />
        <Select
          value={field.type}
          onValueChange={(v) => onUpdate(field.id, { type: v as AgentField['type'] })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer">
          <Checkbox
            checked={field.required ?? false}
            onCheckedChange={(checked) =>
              onUpdate(field.id, { required: checked === true })
            }
          />
          <span className="text-sm font-medium">Required</span>
        </label>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse options' : 'Expand options'}
          className={cn(isExpanded && 'bg-muted')}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(field.id)}
          aria-label="Remove field"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-4 animate-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
              <Input
                id={`placeholder-${field.id}`}
                value={field.placeholder ?? ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value || undefined })}
                placeholder="e.g. Enter your name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`default-${field.id}`}>Default value</Label>
              <Input
                id={`default-${field.id}`}
                value={field.default_value ?? ''}
                onChange={(e) => onUpdate(field.id, { default_value: e.target.value || undefined })}
                placeholder="Optional default"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`regex-${field.id}`}>Validation regex (optional)</Label>
            <Input
              id={`regex-${field.id}`}
              value={regex ?? ''}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="e.g. ^[A-Za-z]+$"
              className="font-mono text-sm"
            />
            {regex && (
              <p className="text-xs text-muted-foreground">
                Input must match this pattern
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Conditional logic</Label>
              <Button variant="outline" size="sm" onClick={addConditionalRule}>
                <Plus className="h-4 w-4" />
                Add rule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Show this field only when conditions are met
            </p>
            {(field.conditionalRules ?? []).length > 0 && (
              <div className="space-y-2">
                {(field.conditionalRules ?? []).map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-card"
                  >
                    <Select
                      value={rule.fieldId}
                      onValueChange={(v) => updateConditionalRule(idx, { fieldId: v })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="When field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {otherFields.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.label || 'Unnamed'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) =>
                        updateConditionalRule(idx, { operator: v as ConditionalRule['operator'] })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONAL_OPERATORS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {rule.operator !== 'empty' && (
                      <Input
                        value={rule.value ?? ''}
                        onChange={(e) =>
                          updateConditionalRule(idx, { value: e.target.value })
                        }
                        placeholder="Value"
                        className="w-32"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConditionalRule(idx)}
                      aria-label="Remove rule"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(field.type === 'select' || field.type === 'multiselect') && (
            <div className="space-y-2">
              <Label>Options (comma-separated)</Label>
              <Input
                value={(field.options ?? []).join(', ')}
                onChange={(e) =>
                  onUpdate(field.id, {
                    options: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface FieldsDesignerProps {
  fields: AgentField[]
  onFieldsChange: (fields: AgentField[]) => void
}

export function FieldsDesigner({ fields, onFieldsChange }: FieldsDesignerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
      ...f,
      order: i,
    }))
    onFieldsChange(reordered)
  }

  const addField = () => {
    const newField: AgentField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New field',
      required: false,
      order: fields.length,
    }
    onFieldsChange([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<AgentField>) => {
    onFieldsChange(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }

  const removeField = (id: string) => {
    const reordered = fields
      .filter((f) => f.id !== id)
      .map((f, i) => ({ ...f, order: i }))
    onFieldsChange(reordered)
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fields designer</CardTitle>
          <Button variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4" />
            Add field
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Configure label, placeholder, validation, and conditional logic.
        </p>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl"
            role="region"
            aria-label="Empty fields"
          >
            <GripVertical className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium">No fields yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add fields to collect structured data from your conversations
            </p>
            <Button variant="outline" className="mt-4" onClick={addField}>
              <Plus className="h-4 w-4" />
              Add first field
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    allFields={fields}
                    onUpdate={updateField}
                    onRemove={removeField}
                    isExpanded={expandedId === field.id}
                    onToggleExpand={() =>
                      setExpandedId((prev) =>
                        prev === field.id ? null : field.id
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}
