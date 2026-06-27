"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
    MessageCircle,
    Gift,
    Users,
    Send,
    Zap,
    Calendar,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Plus,
    X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CrmPage() {
    const params = useParams()
    const [activeCampaign, setActiveCampaign] = useState<any>(null)

    const campaigns = [
        {
            id: 1,
            name: "Aniversariantes do Mês",
            type: "automatic",
            status: "active",
            channel: "whatsapp",
            audience: 45,
            conversion: "12%",
            nextRun: "Amanhã, 09:00",
            message: "Olá {nome}, parabéns! 🎂 Temos um presente especial para você: 20% OFF em qualquer serviço esta semana!"
        },
        {
            id: 2,
            name: "Recuperação de Inativos (30 dias)",
            type: "automatic",
            status: "paused",
            channel: "whatsapp",
            audience: 128,
            conversion: "8%",
            nextRun: "-",
            message: "Oi {nome}, faz tempo que não te vemos! Que tal renovar o visual? Agende hoje e ganhe uma hidratação."
        },
        {
            id: 3,
            name: "Promoção Dia das Mães",
            type: "manual",
            status: "completed",
            channel: "email",
            audience: 850,
            conversion: "15%",
            sentAt: "10/05/2025",
            message: "Mãe merece o melhor! Traga sua mãe e ela ganha 50% de desconto no serviço dela."
        }
    ]

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-pink-500 fill-pink-500" />
                        CRM & Marketing
                    </h1>
                    <p className="text-slate-500 text-lg">Engaje seus clientes com campanhas automáticas.</p>
                </div>
                <Button className="rounded-full h-12 px-6 bg-pink-600 hover:bg-pink-700 text-white gap-2 shadow-lg shadow-pink-500/20">
                    <Plus className="w-5 h-5" />
                    Nova Campanha
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-pink-500 to-rose-600 border-none text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-pink-100 font-medium text-sm flex items-center gap-2">
                            <Send className="w-4 h-4" /> Mensagens Enviadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">2.450</div>
                        <p className="text-pink-100 text-sm mt-1">Neste mês (+15% vs anterior)</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" /> Conversão Estimada
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">R$ 12.5k</div>
                        <p className="text-slate-400 text-sm mt-1">Gerado através de campanhas</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" /> Base Alcançável
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">96%</div>
                        <p className="text-slate-400 text-sm mt-1">Clientes com WhatsApp válido</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <TabsTrigger value="campaigns" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white">
                        <MessageCircle className="w-4 h-4" />
                        Minhas Campanhas
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white">
                        <Gift className="w-4 h-4" />
                        Modelos Prontos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Campaign List */}
                        <div className="lg:col-span-2 space-y-4">
                            {campaigns.map(camp => (
                                <Card key={camp.id} className="group hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-pink-500 cursor-pointer" onClick={() => setActiveCampaign(camp)}>
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{camp.name}</h3>
                                                {camp.type === 'automatic' && (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold">Auto</Badge>
                                                )}
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">{camp.message}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {camp.audience} alvos
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Zap className="w-3 h-3 text-emerald-500" /> {camp.conversion} conv.
                                                </span>
                                                {camp.nextRun !== '-' && (
                                                    <span className="flex items-center gap-1 text-blue-500 font-medium">
                                                        <Clock className="w-3 h-3" /> Próx: {camp.nextRun}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={
                                                camp.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                    camp.status === 'paused' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                                        'bg-slate-100 text-slate-600 hover:bg-slate-100'
                                            }>
                                                {camp.status === 'active' ? 'Ativo' : camp.status === 'paused' ? 'Pausado' : 'Concluído'}
                                            </Badge>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                                <span className="sr-only">Opções</span>
                                                ...
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Editor / Preview */}
                        <div className="lg:col-span-1">
                            <Card className="h-full border-none shadow-lg bg-slate-50 dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Editor Rápido</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {activeCampaign ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Nome da Campanha</Label>
                                                <Input value={activeCampaign.name} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mensagem</Label>
                                                <div className="relative">
                                                    <Textarea
                                                        value={activeCampaign.message}
                                                        className="min-h-[150px] resize-none pr-10"
                                                    />
                                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" title="Inserir Nome">
                                                            <Users className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" title="Inserir Emoji">
                                                            😊
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400">Variáveis disponíveis: {'{nome}'}, {'{servico_ultimo}'}, {'{data_aniversario}'}</p>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-t border-b border-slate-200">
                                                <Label>Status</Label>
                                                <Switch checked={activeCampaign.status === 'active'} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">Salvar Alterações</Button>
                                                <Button variant="outline" onClick={() => setActiveCampaign(null)}>Cancelar</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>Selecione uma campanha para editar ou crie uma nova.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="templates">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {['Lembrete de Agendamento', 'Pesquisa de Satisfação NPS', 'Promoção Relâmpago', 'Boas-vindas', 'Feliz Aniversário', 'Reativação de Cliente Sumido'].map((template, i) => (
                            <Card key={i} className="hover:border-pink-500 cursor-pointer transition-colors border-dashed bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                                <CardHeader>
                                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center mb-2 text-pink-500">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base">{template}</CardTitle>
                                    <CardDescription>Modelo pronto para uso imediato.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full">Usar Modelo</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
