import { useRef, useState } from 'react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export interface AvatarUploaderProps {
  avatarUrl?: string | null
  name: string
  onUpload: (file: File) => Promise<void>
  onRemove: () => Promise<void>
  className?: string
}

export function AvatarUploader({
  avatarUrl,
  name,
  onUpload,
  onRemove,
  className,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = () => {
    setError(null)
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPEG or PNG image.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`)
      return
    }

    setIsUploading(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!avatarUrl) return
    setIsUploading(true)
    setError(null)
    try {
      await onRemove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative group">
        <Avatar className="h-24 w-24 rounded-full border-4 border-card shadow-card transition-all duration-300 group-hover:shadow-card-hover">
          {isUploading ? (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <AvatarImage src={avatarUrl ?? undefined} alt={name} />
              <AvatarFallback className="text-xl">
                {getInitials(name)}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleEdit}
            disabled={isUploading}
            aria-label="Edit avatar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleRemove}
              disabled={isUploading}
              aria-label="Remove avatar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEdit}
          disabled={isUploading}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive animate-shake" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
