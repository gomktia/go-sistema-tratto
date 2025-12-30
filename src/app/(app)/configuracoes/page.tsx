"use client"

import { useState } from "react"
import { Save, Upload, Palette, Clock, Calendar, ShieldCheck, Sparkles } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

export default function ConfiguracoesPage() {
    const { currentTenant, setCurrentTenant } = useTenant()

    const [primaryColor, setPrimaryColor] = useState(currentTenant.customPrimaryColor || currentTenant.primaryColor)
    const [secondaryColor, setSecondaryColor] = useState(currentTenant.customSecondaryColor || currentTenant.secondaryColor)
    const [customDomain, setCustomDomain] = useState(currentTenant.customDomain || '')
    const [logoPreview, setLogoPreview] = useState(currentTenant.customLogo || '')
    const [bufferTime, setBufferTime] = useState("15")

    const weekDays = [
        { id: 'seg', label: 'Segunda-feira', open: '09:00', close: '18:00', active: true },
        { id: 'ter', label: 'Terça-feira', open: '09:00', close: '18:00', active: true },
        { id: 'qua', label: 'Quarta-feira', open: '09:00', close: '18:00', active: true },
        { id: 'qui', label: 'Quinta-feira', open: '09:00', close: '20:00', active: true },
        { id: 'sex', label: 'Sexta-feira', open: '09:00', close: '20:00', active: true },
        { id: 'sab', label: 'Sábado', open: '08:00', close: '16:00', active: true },
        { id: 'dom', label: 'Domingo', open: '00:00', close: '00:00', active: false },
    ]

    const handleSave = async () => {
        const supabase = getSupabaseBrowserClient()

        if (supabase && isSupabaseConfigured) {
            try {
                // Atualiza as cores no Supabase
                const { error } = await supabase
                    .from('tenants')
                    .update({
                        theme: {
                            primary: primaryColor,
                            secondary: secondaryColor
                        },
                        logo_url: logoPreview || null,
                        settings: {
                            custom_domain: customDomain
                        }
                    })
                    .eq('id', currentTenant.id)

                if (error) {
                    console.error('Erro ao salvar configurações:', error)
                    alert('Erro ao salvar configurações. Por favor, tente novamente.')
                    return
                }
            } catch (error) {
                console.error('Erro ao salvar configurações:', error)
                alert('Erro ao salvar configurações. Por favor, tente novamente.')
                return
            }
        }

        // Atualiza o contexto local
        const updatedTenant = {
            ...currentTenant,
            customPrimaryColor: primaryColor,
            customSecondaryColor: secondaryColor,
            customDomain: customDomain,
            customLogo: logoPreview
        }
        setCurrentTenant(updatedTenant)

        // Aplica as cores localmente
        document.documentElement.style.setProperty('--primary', primaryColor)
        document.documentElement.style.setProperty('--secondary', secondaryColor)

        alert('Configurações salvas com sucesso!')
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setLogoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Configurações</h2>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">
                        Gerencie as regras operacionais e identidade da sua empresa.
                    </p>
                </div>
                <Button onClick={handleSave} size="lg" className="rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 h-14 px-8">
                    <Save className="w-5 h-5 mr-2" /> Salvar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Operational Hours */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Horários de Funcionamento</h3>
                                <p className="text-sm text-slate-500">Defina quando sua empresa está aberta para agendamentos.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {weekDays.map((day) => (
                                <div key={day.id} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <Switch checked={day.active} />
                                        <span className={cn("font-bold text-sm", day.active ? "text-slate-900 dark:text-white" : "text-slate-300")}>
                                            {day.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            disabled={!day.active}
                                            defaultValue={day.open}
                                            className="w-20 h-10 rounded-xl text-center font-bold border-none bg-slate-100 dark:bg-zinc-800 focus:ring-primary"
                                        />
                                        <span className="text-slate-300">até</span>
                                        <Input
                                            disabled={!day.active}
                                            defaultValue={day.close}
                                            className="w-20 h-10 rounded-xl text-center font-bold border-none bg-slate-100 dark:bg-zinc-800 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Operational Rules */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-primary">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Regras de Agendamento</h3>
                                <p className="text-sm text-slate-500">Intervalos e políticas de cancelamento.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">Tempo de Respiro (Cleaning Buffer)</Label>
                                    <p className="text-xs text-slate-500">Intervalo automático adicionado entre cada serviço.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={bufferTime}
                                        onChange={(e) => setBufferTime(e.target.value)}
                                        className="w-20 h-12 rounded-xl text-center font-bold border-none bg-slate-100 dark:bg-zinc-800"
                                    />
                                    <span className="text-sm font-bold text-slate-400">min</span>
                                </div>
                            </div>

                            <Card className="p-4 rounded-3xl bg-primary/5 border-primary/10 flex gap-3 items-center">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-normal">
                                    Esta regra será aplicada globalmente a todos os serviços da {currentTenant.name}.
                                </p>
                            </Card>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Visual Identity */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-primary">
                                <Palette className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Identidade Visual</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Logo da Empresa</Label>
                                <div className="relative group w-32 h-32 mx-auto">
                                    <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-800">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl">{currentTenant.logo}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-white"
                                    >
                                        <Upload className="w-6 h-6" />
                                    </button>
                                    <input type="file" id="logo-upload" className="hidden" onChange={handleLogoUpload} />
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <ColorPicker label="Cor Primária" color={primaryColor} onChange={setPrimaryColor} />
                                <ColorPicker label="Cor Secundária" color={secondaryColor} onChange={setSecondaryColor} />
                            </div>

                            <div className="pt-4">
                                <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-2xl rounded-full translate-x-10 -translate-y-10" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview do Botão</p>
                                    <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold pointer-events-none">
                                        Agendar Agora
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Premium Upgrade Card */}
                    <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-400" />
                        <div className="relative z-10 space-y-4">
                            <h3 className="font-black text-xl leading-tight">Domínio Próprio?</h3>
                            <p className="text-sm text-indigo-100 italic">&ldquo;Use suaempresa.com.br ao invés de beautyflow.app&rdquo;</p>
                            <Button className="w-full h-12 rounded-xl bg-white text-indigo-600 font-bold hover:bg-white/90">
                                Ver Planos Pro
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
