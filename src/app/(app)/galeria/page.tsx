"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useTenant } from "@/contexts/tenant-context"
import { useTenantGallery } from "@/hooks/useTenantRecords"
import { ImageUpload } from "@/components/ui/image-upload"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { GalleryImage } from "@/types/catalog"

export default function GaleriaPage() {
    const { currentTenant } = useTenant()
    const { data: galleryImages } = useTenantGallery(currentTenant.id)
    const [localImages, setLocalImages] = useState<GalleryImage[]>([])

    // Sync with hook data
    useEffect(() => {
        if (galleryImages) setLocalImages(galleryImages)
    }, [galleryImages])

    const [showNewImage, setShowNewImage] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: ""
    })

    const handleAddImage = async () => {
        const supabase = getSupabaseBrowserClient()
        if (supabase && isSupabaseConfigured) {
            try {
                const { error } = await supabase.from('gallery_images').insert({
                    tenant_id: currentTenant.id,
                    image_url: formData.imageUrl,
                    title: formData.title,
                    display_order: localImages.length + 1
                })

                if (error) throw error

                const newImage: GalleryImage = {
                    id: Math.random().toString(36), // Temp ID
                    tenantId: currentTenant.id,
                    url: formData.imageUrl,
                    title: formData.title,
                    category: 'general',
                    displayOrder: localImages.length + 1
                }
                setLocalImages([...localImages, newImage])

            } catch (err) {
                console.error("Error adding image:", err)
                alert("Erro ao salvar imagem.")
            }
        } else {
            // Mock fallback
            const newImage: GalleryImage = {
                id: Math.random().toString(36),
                tenantId: currentTenant.id,
                url: formData.imageUrl,
                title: formData.title,
                category: 'general',
                displayOrder: localImages.length + 1
            }
            setLocalImages([...localImages, newImage])
        }

        setShowNewImage(false)
        setFormData({ title: "", imageUrl: "" })
    }

    const handleDelete = async () => {
        if (!selectedImage) return

        const supabase = getSupabaseBrowserClient()
        if (supabase && isSupabaseConfigured) {
            await supabase.from('gallery_images').delete().eq('id', selectedImage.id)
        }

        setLocalImages(localImages.filter(img => img.id !== selectedImage.id))
        setShowDeleteConfirm(false)
        setSelectedImage(null)
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Galeria</h2>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Fotos do ambiente e atmosfera da sua empresa.</p>
                </div>
                <Button onClick={() => setShowNewImage(true)} className="rounded-xl h-12 px-6 bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Foto
                </Button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {localImages.map((image) => (
                    <Card key={image.id} className="group relative overflow-hidden rounded-[2rem] border-none shadow-lg bg-white dark:bg-zinc-900 aspect-square">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <p className="text-white font-bold text-lg">{image.title}</p>
                            <Button
                                onClick={() => { setSelectedImage(image); setShowDeleteConfirm(true); }}
                                variant="destructive"
                                size="sm"
                                className="mt-2 w-full rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-sm"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                        </div>
                    </Card>
                ))}

                {/* Empty State placeholder if no images */}
                {localImages.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-lg font-bold">Nenhuma foto na galeria.</p>
                        <p className="text-sm">Adicione fotos para mostrar seu ambiente aos clientes.</p>
                    </div>
                )}
            </div>

            {/* Add Image Dialog */}
            <FormDialog
                open={showNewImage}
                onOpenChange={setShowNewImage}
                title="Adicionar Foto"
                description="Envie uma nova foto para a galeria."
                onSubmit={handleAddImage}
                submitLabel="Salvar Foto"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Título da Foto (Opcional)</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Recepção, Área de Corte..."
                            className="rounded-xl bg-slate-50 dark:bg-zinc-800 border-none h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Imagem</Label>
                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            bucket="images"
                            path={`gallery/${currentTenant.id}`}
                        />
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Excluir Foto?"
                description="Essa ação não pode ser desfeta."
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    )
}
