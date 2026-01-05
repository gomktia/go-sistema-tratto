"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { tenants, type Tenant } from "@/mocks/tenants"
import { cn } from "@/lib/utils"
import { Palette, Scissors, Users, Wallet, CheckCircle2 } from "lucide-react"

interface OnboardingWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant: Tenant
}

const steps = [
    {
        id: "brand",
        title: "Identidade visual",
        description: "Defina cores, tom de voz e como deseja ser reconhecido.",
        icon: Palette,
        hints: ["Logo em alta resolução", "Paleta principal e secundária", "Domínio desejado"],
    },
    {
        id: "services",
        title: "Serviços e buffers",
        description: "Descubra quais serviços serão ofertados online e buffers mínimos.",
        icon: Scissors,
        hints: ["Serviço carro-chefe", "Tempo médio", "Depósito obrigatório?"],
    },
    {
        id: "team",
        title: "Equipe e acessos",
        description: "Convide profissionais e defina permissões para cada perfil.",
        icon: Users,
        hints: ["Cargo/função", "Comissão padrão", "Disponibilidade semanal"],
    },
    {
        id: "payments",
        title: "Pagamentos e PDV",
        description: "Configure Pix, cartão e integrações com maquininhas.",
        icon: Wallet,
        hints: ["Conta bancária", "Gateway favorito", "Split com profissionais"],
    },
]

export function OnboardingWizard({ open, onOpenChange, tenant }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [notes, setNotes] = useState<Record<string, string>>({})

    const StepIcon = steps[currentStep].icon

    const isLastStep = currentStep === steps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onOpenChange(false)
            setCurrentStep(0)
            return
        }
        setCurrentStep((prev) => prev + 1)
    }

    const handleBack = () => {
        if (currentStep === 0) {
            onOpenChange(false)
            return
        }
        setCurrentStep((prev) => prev - 1)
    }

    const completionPercent = useMemo(() => {
        const filled = Object.values(notes).filter((value) => value?.trim().length > 3).length
        return Math.min(100, Math.round((filled / steps.length) * 100))
    }, [notes])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <div className="grid md:grid-cols-[260px_1fr] min-h-[500px]">
                    <div className="bg-slate-900 text-white p-8 flex flex-col gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Onboarding guiado</p>
                            <h2 className="text-2xl font-black leading-tight">{tenant.fullName}</h2>
                            <p className="text-sm text-white/70">Vamos deixar tudo pronto em poucos passos.</p>
                        </div>

                        <div className="space-y-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon
                                const active = index === currentStep
                                const completed = index < currentStep
                                return (
                                    <div key={step.id} className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors",
                                                active && "border-white bg-white/10",
                                                completed && "border-emerald-400 bg-emerald-500/20",
                                                !active && !completed && "border-white/20 text-white/60"
                                            )}
                                        >
                                            {completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-bold", active ? "text-white" : "text-white/70")}>{step.title}</p>
                                            <p className="text-[11px] text-white/50">{step.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                                Progresso
                            </p>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-purple-400"
                                    style={{ width: `${completionPercent}%` }}
                                />
                            </div>
                            <p className="text-xs font-semibold mt-2">{completionPercent}% preenchido</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <StepIcon className="w-5 h-5 text-primary" />
                                </span>
                                {steps[currentStep].title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                {steps[currentStep].description}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas / briefing</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Compartilhe detalhes importantes para este passo..."
                                        value={notes[steps[currentStep].id] ?? ""}
                                        onChange={(event) =>
                                            setNotes((prev) => ({ ...prev, [steps[currentStep].id]: event.target.value }))
                                        }
                                        className="min-h-[120px] resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {steps[currentStep].hints.map((hint) => (
                                        <Badge
                                            key={hint}
                                            variant="outline"
                                            className="rounded-xl text-[10px] uppercase tracking-widest py-2 text-slate-500"
                                        >
                                            {hint}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Checklist rápido</p>
                                <div className="grid gap-2">
                                    <Input placeholder="Link de referência / arquivo" className="bg-white" />
                                    <Input placeholder="Responsável designado" className="bg-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={handleBack}
                            >
                                {currentStep === 0 ? "Cancelar" : "Voltar"}
                            </Button>
                            <Button
                                className="rounded-xl"
                                onClick={handleNext}
                            >
                                {isLastStep ? "Concluir" : "Próximo passo"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}



