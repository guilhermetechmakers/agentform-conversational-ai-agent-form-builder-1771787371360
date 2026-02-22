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
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { AgentField } from '@/types'

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Text area' },
] as const

interface SortableFieldItemProps {
  field: AgentField
  onUpdate: (id: string, updates: Partial<AgentField>) => void
  onRemove: (id: string) => void
}

function SortableFieldItem({ field, onUpdate, onRemove }: SortableFieldItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all duration-200',
        isDragging && 'opacity-80 shadow-card-hover z-10'
      )}
    >
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
        onClick={() => onRemove(field.id)}
        aria-label="Remove field"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface FieldsDesignerProps {
  fields: AgentField[]
  onFieldsChange: (fields: AgentField[]) => void
}

export function FieldsDesigner({ fields, onFieldsChange }: FieldsDesignerProps) {
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
          Drag to reorder. Define the structured data this agent collects.
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
                    onUpdate={updateField}
                    onRemove={removeField}
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
