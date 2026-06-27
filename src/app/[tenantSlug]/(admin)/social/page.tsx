"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    Sparkles,
    Instagram,
    Facebook,
    Video, // TikTok alternative
    Calendar,
    CheckCircle2,
    Loader2,
    Image as ImageIcon,
    Wand2,
    Share2,
    MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SocialAiPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [generatedPost, setGeneratedPost] = useState<any>(null)
    const [autoSchedule, setAutoSchedule] = useState(true)

    // Mock "AI" Generation
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create fake local URL
            const url = URL.createObjectURL(file)
            setUploadedImage(url)
            setGeneratedPost(null) // Reset previous
        }
    }

    const generateContent = () => {
        setIsGenerating(true)

        // Simulate AI thinking time
        setTimeout(() => {
            setGeneratedPost({
                title: "Transformação Total ✨",
                platforms: {
                    instagram: {
                        caption: "Olha esse resultado incrível! 😍 Nada como renovar a autoestima com um visual novo. O que acharam dessa transformação? \n\nAgende seu horário pelo link na bio! 👇\n\n#salaodebeleza #transformação #cabelos #beleza #autoestima #tratto",
                        tags: ["#hairgoals", "#beauty", "#salonlife"],
                        previewTime: "Amanhã, 18:30 (Melhor horário)"
                    },
                    tiktok: {
                        caption: "Wait for it... ✨ Nova transformação no salão! Quem amou? #hairtok #fy #salao",
                        tags: ["#fyp", "#viral", "#hair"],
                        previewTime: "Hoje, 20:00"
                    },
                    facebook: {
                        caption: "Mais um cliente satisfeito aqui no Tratto! Venha conhecer nossos serviços e tomar um café com a gente. ☕",
                        tags: [],
                        previewTime: "Amanhã, 12:00"
                    }
                }
            })
            setIsGenerating(false)
        }, 3000)
    }

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-indigo-500 fill-indigo-500 animate-pulse" />
                        Tratto Social IA
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Você posta a foto, a IA cria e agenda tudo sozinha.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                        <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Modo Autopilot: Ativado</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Upload & Control */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 shadow-none">
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                            {uploadedImage ? (
                                <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden group border border-slate-200 dark:border-zinc-700">
                                    <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="secondary" onClick={() => setUploadedImage(null)}>Trocar Foto</Button>
                                    </div>
                                    {/* Scanning Effect Overlay */}
                                    {isGenerating && (
                                        <motion.div
                                            className="absolute inset-0 bg-indigo-500/20"
                                            initial={{ top: "-100%" }}
                                            animate={{ top: "100%" }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        >
                                            <div className="w-full h-2 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                        <Upload className="w-10 h-10 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Arraste sua foto aqui</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xs">Ou clique para selecionar da galeria. Suportamos JPG, PNG e HEIC.</p>
                                    <Label htmlFor="image-upload" className="cursor-pointer mt-4">
                                        <div className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 dark:border-white/20 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                            Selecionar Arquivo
                                        </div>
                                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </Label>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações da Geração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Agendamento Automático</Label>
                                    <p className="text-xs text-slate-500">A IA escolhe o melhor horário e posta sozinha.</p>
                                </div>
                                <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
                            </div>

                            <div className="space-y-4">
                                <Label>Onde postar?</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-3 rounded-xl border border-indigo-200 bg-indigo-50 flex flex-col items-center gap-2 cursor-pointer ring-2 ring-indigo-500">
                                        <Instagram className="w-6 h-6 text-pink-600" />
                                        <span className="text-xs font-bold text-indigo-900">Instagram</span>
                                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 flex flex-col items-center gap-2 cursor-pointer opacity-60">
                                        <Video className="w-6 h-6 text-black" />
                                        <span className="text-xs font-bold text-slate-900">TikTok</span>
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 flex flex-col items-center gap-2 cursor-pointer opacity-60">
                                        <Facebook className="w-6 h-6 text-blue-600" />
                                        <span className="text-xs font-bold text-slate-900">Facebook</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl"
                                disabled={!uploadedImage || isGenerating}
                                onClick={generateContent}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Agente IA Trabalhando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Gerar Conteúdo com IA
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AI Config Panel (n8n/Anthropic) */}
                    <Card className="bg-slate-900 border-none text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2">
                                <Wand2 className="w-4 h-4" /> Cérebro da Operação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Motor de Inteligência</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white justify-start">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                        n8n Agent
                                    </Button>
                                    <Button variant="ghost" className="text-slate-400 hover:text-white justify-start">
                                        Claude 3.5 Sonnet
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl space-y-2 border border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-slate-400">Webhook Status</span>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">CONECTADO</Badge>
                                </div>
                                <div className="text-xs text-slate-500 font-mono truncate">
                                    https://n8n.tratto.ai/webhook/social-generator
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Results & Preview */}
                <div className="lg:col-span-7 space-y-6">
                    <AnimatePresence mode="wait">
                        {generatedPost ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900">Conteúdo Gerado</h2>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Pronto para postar
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Instagram Preview */}
                                    <Card className="overflow-hidden border-none shadow-2xl">
                                        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1">
                                            <div className="bg-white p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Instagram className="w-5 h-5 text-pink-600" />
                                                    <span className="font-bold text-sm">Instagram Feed</span>
                                                </div>
                                                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3">
                                                    <img src={uploadedImage!} alt="Preview da postagem" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-slate-800 whitespace-pre-line">
                                                        {generatedPost.platforms.instagram.caption}
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {generatedPost.platforms.instagram.tags.join(" ")}
                                                    </p>
                                                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                                        <span>Agendado para:</span>
                                                        <span className="font-bold text-slate-700">{generatedPost.platforms.instagram.previewTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Action Buttons */}
                                    <div className="space-y-4">
                                        <Card className="bg-slate-900 text-white p-6 border-none shadow-xl">
                                            <h3 className="font-bold text-lg mb-2">Ações Sugeridas</h3>
                                            <div className="space-y-3">
                                                <Button variant="secondary" className="w-full justify-start h-12 text-slate-900 hover:bg-slate-200">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Confirmar Agendamento
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start h-12 border-slate-700 hover:bg-slate-800 text-white hover:text-white">
                                                    <Wand2 className="w-4 h-4 mr-2" />
                                                    Regerar Legenda
                                                </Button>
                                            </div>
                                        </Card>

                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                            <div className="flex gap-3">
                                                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="font-bold text-emerald-800 text-sm">Análise da IA</p>
                                                    <p className="text-xs text-emerald-700 leading-relaxed">
                                                        Identifiquei um sorriso radiante e iluminação quente. Tons de loiro estão em alta (trend +45%). Usei hashtags virais para maximizar alcance na sua região.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            // Empty State / Placeholder with "Recent Posts"
                            <div className="h-full flex flex-col">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Agendamentos Futuros</h2>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm">
                                            <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-zinc-700 shrink-0 animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-700 rounded animate-pulse" />
                                                <div className="h-3 w-1/2 bg-slate-200 dark:bg-zinc-700 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
