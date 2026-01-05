"use client"

import { useMemo, useState } from "react"
import { playbooks } from "@/mocks/playbooks"
import { companies } from "@/mocks/companies"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"
import { Zap, Target } from "lucide-react"

const categoryLabels: Record<string, { label: string, color: string }> = {
    retention: { label: "Retenção", color: "bg-emerald-500/10 text-emerald-600" },
    billing: { label: "Cobrança", color: "bg-amber-500/10 text-amber-600" },
    support: { label: "Suporte", color: "bg-blue-500/10 text-blue-600" },
    growth: { label: "Crescimento", color: "bg-purple-500/10 text-purple-600" }
}

export default function PlaybooksPage() {
    const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null)
    const [selectedCompany, setSelectedCompany] = useState<string>("")
    const [notes, setNotes] = useState("")

    const openPlaybook = playbooks.find(playbook => playbook.id === selectedPlaybook) || null

    const stats = useMemo(() => {
        const runs = playbooks.filter(p => Boolean(p.lastRunAt)).length
        const retention = playbooks.filter(p => p.category === "retention").length
        const billing = playbooks.filter(p => p.category === "billing").length
        return { total: playbooks.length, runs, retention, billing }
    }, [])

    const handleRun = () => {
        setSelectedPlaybook(null)
        setSelectedCompany("")
        setNotes("")
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Playbooks & Automações</h2>
                    <p className="text-muted-foreground mt-1">
                        Ações rápidas para retenção, billing e suporte — sem depender do time técnico.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full gap-2">
                        <Target className="w-4 h-4" />
                        Ver métricas
                    </Button>
                    <Button className="rounded-full gap-2">
                        <Zap className="w-4 h-4" />
                        Criar playbook
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Playbooks disponíveis" value={stats.total} />
                <StatCard label="Executados recentemente" value={stats.runs} />
                <StatCard label="Foco: Retenção" value={stats.retention} />
                <StatCard label="Foco: Cobrança" value={stats.billing} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {playbooks.map((playbook) => {
                    const category = categoryLabels[playbook.category]
                    return (
                        <Card key={playbook.id} className="rounded-3xl border-none shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>{playbook.title}</CardTitle>
                                        <CardDescription>{playbook.description}</CardDescription>
                                    </div>
                                    <Badge className={category?.color}>{category?.label}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Impacto estimado</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{playbook.estimatedImpact}</p>
                                </div>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    {playbook.steps.map((step, index) => (
                                        <p key={step}>{index + 1}. {step}</p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                    <p>Último disparo: {playbook.lastRunAt ? new Date(playbook.lastRunAt).toLocaleString("pt-BR") : "Nunca"}</p>
                                    <Button size="sm" className="rounded-full" onClick={() => setSelectedPlaybook(playbook.id)}>
                                        Executar playbook
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Dialog open={Boolean(openPlaybook)} onOpenChange={() => setSelectedPlaybook(null)}>
                {openPlaybook && (
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Executar {openPlaybook.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Empresa alvo</p>
                                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map(company => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Observações adicionais</p>
                                <Textarea placeholder="Contexto ou instruções extras" value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Responsável</p>
                                <Input placeholder="Nome do analista" />
                            </div>
                            <Button className="w-full" onClick={handleRun}>Disparar playbook</Button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
            <CardContent className="py-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
            </CardContent>
        </Card>
    )
}



