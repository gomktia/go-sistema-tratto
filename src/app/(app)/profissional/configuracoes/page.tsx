"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Settings,
    Bell,
    Shield,
    Palette,
    Save,
    Check,
    Calendar,
    MessageCircle,
    Smartphone
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { employees } from "@/mocks/services"

export default function ConfiguracoesPage() {
    const { user } = useAuth()
    const currentEmployee = employees.find(emp => emp.id === user?.id)

    const [settings, setSettings] = useState({
        // Notificações
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        appointmentReminders: true,
        cancelNotifications: true,

        // Agendamento Online
        acceptsOnlineBooking: currentEmployee?.acceptsOnlineBooking ?? true,
        roundRobinEnabled: currentEmployee?.roundRobinEnabled ?? false,

        // Preferências
        defaultServiceDuration: 60,
        bufferBetweenAppointments: 15,
        theme: "system" as "light" | "dark" | "system",

        // Contato
        phone: currentEmployee?.phone || "",
        email: currentEmployee?.email || "",
    })

    const [hasChanges, setHasChanges] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setHasChanges(true)
        setSaveSuccess(false)
    }

    const handleSave = () => {
        // Save to backend/Supabase
        console.log('Saving settings:', settings)
        setHasChanges(false)
        setSaveSuccess(true)

        setTimeout(() => setSaveSuccess(false), 3000)
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        Configurações
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Personalize suas preferências e notificações
                    </p>
                </div>
                {hasChanges && (
                    <Button onClick={handleSave} className="rounded-xl gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </Button>
                )}
                {saveSuccess && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none gap-2">
                        <Check className="w-4 h-4" />
                        Salvo com sucesso
                    </Badge>
                )}
            </div>

            {/* Notifications Section */}
            <Card className="p-6 rounded-2xl border-none shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                        <p className="text-xs text-muted-foreground">Como você quer ser notificado</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">Notificações por Email</p>
                                <p className="text-xs text-muted-foreground">Receba atualizações no seu email</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(val) => handleChange('emailNotifications', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">Notificações por SMS</p>
                                <p className="text-xs text-muted-foreground">Receba mensagens de texto</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.smsNotifications}
                            onCheckedChange={(val) => handleChange('smsNotifications', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Notificações no navegador/app</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.pushNotifications}
                            onCheckedChange={(val) => handleChange('pushNotifications', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">Lembretes de Agendamento</p>
                                <p className="text-xs text-muted-foreground">1 hora antes dos atendimentos</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.appointmentReminders}
                            onCheckedChange={(val) => handleChange('appointmentReminders', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">Cancelamentos</p>
                                <p className="text-xs text-muted-foreground">Quando um cliente cancelar</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.cancelNotifications}
                            onCheckedChange={(val) => handleChange('cancelNotifications', val)}
                        />
                    </div>
                </div>
            </Card>

            {/* Online Booking Section */}
            <Card className="p-6 rounded-2xl border-none shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Agendamento Online</h3>
                        <p className="text-xs text-muted-foreground">Como clientes podem agendar com você</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold">Aceitar Agendamentos Online</p>
                            <p className="text-xs text-muted-foreground">
                                Permite que clientes agendem diretamente com você
                            </p>
                        </div>
                        <Switch
                            checked={settings.acceptsOnlineBooking}
                            onCheckedChange={(val) => handleChange('acceptsOnlineBooking', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold">Round Robin</p>
                            <p className="text-xs text-muted-foreground">
                                Distribui agendamentos automaticamente entre profissionais
                            </p>
                        </div>
                        <Switch
                            checked={settings.roundRobinEnabled}
                            onCheckedChange={(val) => handleChange('roundRobinEnabled', val)}
                        />
                    </div>
                </div>
            </Card>

            {/* Appearance */}
            <Card className="p-6 rounded-2xl border-none shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Aparência</h3>
                        <p className="text-xs text-muted-foreground">Personalize a interface</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Tema</Label>
                        <Select
                            value={settings.theme}
                            onValueChange={(val: any) => handleChange('theme', val)}
                        >
                            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Claro</SelectItem>
                                <SelectItem value="dark">Escuro</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 rounded-2xl border-none shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Preferências de Atendimento</h3>
                        <p className="text-xs text-muted-foreground">Configure seus padrões</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Duração Padrão (min)</Label>
                        <Input
                            type="number"
                            value={settings.defaultServiceDuration}
                            onChange={(e) => handleChange('defaultServiceDuration', Number(e.target.value))}
                            className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Intervalo Entre Atendimentos (min)</Label>
                        <Input
                            type="number"
                            value={settings.bufferBetweenAppointments}
                            onChange={(e) => handleChange('bufferBetweenAppointments', Number(e.target.value))}
                            className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800"
                        />
                    </div>
                </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 rounded-2xl border-none shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Informações de Contato</h3>
                        <p className="text-xs text-muted-foreground">Seus dados de contato</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Email</Label>
                        <Input
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Telefone</Label>
                        <Input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800"
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}
