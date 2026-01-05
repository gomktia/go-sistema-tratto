"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
    bucket: string
    path: string
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    bucket,
    path,
    className
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const supabase = getSupabaseBrowserClient()

        if (!supabase) {
            alert("Erro de configuração do Supabase")
            setIsUploading(false)
            return
        }

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}` // Simple unique name
            const fullPath = `${path}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fullPath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fullPath)

            onChange(publicUrl)
        } catch (error) {
            console.error("Error uploading image:", error)
            alert("Erro ao fazer upload da imagem")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemove = () => {
        onChange("")
    }

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/50 flex flex-col items-center justify-center gap-2 text-center overflow-hidden",
                    value ? "h-48 border-none bg-slate-100 dark:bg-zinc-900" : "h-32",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    disabled={disabled || isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-slate-500 font-medium">Enviando...</p>
                    </div>
                ) : value ? (
                    <>
                        <img
                            src={value}
                            alt="Upload"
                            className="w-full h-full object-cover rounded-2xl absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                Clique para adicionar foto
                            </p>
                            <p className="text-[10px] text-slate-400">
                                JPG, PNG ou WEBP até 5MB
                            </p>
                        </div>
                    </>
                )}
            </div>

            {value && !isUploading && !disabled && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRemove()
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
                    >
                        <X className="w-3 h-3 mr-2" />
                        Remover foto
                    </Button>
                </div>
            )}
        </div>
    )
}
