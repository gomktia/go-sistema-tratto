'use client'

import { useState, useRef } from 'react'
import { Upload, X, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  tenantId: string
  employeeId?: string
  currentAvatarUrl?: string
  onUploadComplete: (url: string) => void
  className?: string
}

export function AvatarUpload({
  tenantId,
  employeeId,
  currentAvatarUrl,
  onUploadComplete,
  className
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validações
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo: 2MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WebP')
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload para Supabase
    if (!isSupabaseConfigured || !employeeId) {
      // Sem Supabase, só mostra preview
      return
    }

    setUploading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) throw new Error('Supabase não disponível')

      // Nome do arquivo único
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenantId}/${employeeId}-${Date.now()}.${fileExt}`

      // Upload para storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      // Deletar avatar antigo se existir
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/avatars/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      onUploadComplete(publicUrl)
    } catch (err: any) {
      console.error('[AvatarUpload] Erro:', err)
      setError(err.message || 'Erro ao fazer upload')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!previewUrl) return

    setError(null)

    if (isSupabaseConfigured && employeeId && currentAvatarUrl) {
      setUploading(true)
      try {
        const supabase = getSupabaseBrowserClient()
        if (supabase) {
          const path = currentAvatarUrl.split('/avatars/').pop()
          if (path) {
            await supabase.storage.from('avatars').remove([path])
          }
        }
      } catch (err: any) {
        console.error('[AvatarUpload] Erro ao remover:', err)
      } finally {
        setUploading(false)
      }
    }

    setPreviewUrl(null)
    onUploadComplete('')
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4">
        {/* Preview do Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-slate-200 dark:border-zinc-700">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {previewUrl ? 'Trocar Foto' : 'Adicionar Foto'}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WebP. Máximo 2MB.
      </p>
    </div>
  )
}
