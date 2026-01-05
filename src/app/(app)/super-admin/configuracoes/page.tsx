"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save, Settings, Mail, CreditCard, Bell, Bot, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Componente de Card de Integração
interface IntegrationCardProps {
    id: string
    title: string
    description: string
    icon: React.ElementType
    color: string
    isActive: boolean
    children: React.ReactNode
    onSave: () => void
    onToggle: () => void
}

function IntegrationCard({ id, title, description, icon: Icon, color, isActive, children, onSave, onToggle }: IntegrationCardProps) {
    return (
        <div className={cn(
            "rounded-xl border transition-all duration-200 overflow-hidden",
            isActive ? "border-primary ring-1 ring-primary/20 bg-white dark:bg-zinc-900" : "border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50"
        )}>
            <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={onToggle}>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{title}</h4>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                </div>
            </div>

            {isActive && (
                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Separator className="my-3" />
                    <div className="space-y-3">
                        {children}
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); onSave(); }} className="w-full mt-2">
                            Salvar Configuração
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ConfiguracoesPage() {
    // --- State Initialization with LocalStorage (Client-Side Only) ---
    const [platformSettings, setPlatformSettings] = useState({
        platformName: "BeautyFlow",
        platformEmail: "suporte@beautyflow.com",
        platformDomain: "beautyflow.app",
        logo: "BF"
    })

    const [integrations, setIntegrations] = useState({
        stripeApiKey: "",
        mercadoPagoToken: "",
        asaasApiKey: "",
        korvexApiKey: "",
        sendgridApiKey: "",
        twilioAccountSid: "",
        twilioAuthToken: "",
        whatsappBusinessId: "",
        openAiApiKey: "",
        anthropicApiKey: "",
        invoiceProvider: "enotas",
        invoiceApiKey: ""
    })

    const [notifications, setNotifications] = useState({
        emailOnNewCompany: true,
        emailOnPaymentReceived: true,
        emailOnPaymentFailed: true,
        emailOnTrialExpiring: true,
        smsOnCriticalEvents: false
    })

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Hydrate from LocalStorage after mount
        const savedPlatform = localStorage.getItem('bf_platform_settings')
        if (savedPlatform) setPlatformSettings(JSON.parse(savedPlatform))

        const savedIntegrations = localStorage.getItem('bf_integrations')
        if (savedIntegrations) setIntegrations(JSON.parse(savedIntegrations))

        const savedNotifications = localStorage.getItem('bf_notifications')
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications))

        setIsLoaded(true)
    }, [])


    const [activeCard, setActiveCard] = useState<string | null>(null)

    // --- Persistence Handlers ---

    const handleSavePlatform = () => {
        localStorage.setItem('bf_platform_settings', JSON.stringify(platformSettings))
        const btn = document.getElementById('save-platform-btn')
        if (btn) {
            const originalText = btn.innerText
            btn.innerText = "Salvo!"
            setTimeout(() => btn.innerText = originalText, 2000)
        }
    }

    const handleSaveIntegration = (name: string) => {
        localStorage.setItem('bf_integrations', JSON.stringify(integrations))
        // Could use a toast here
        alert(`${name} salvo com sucesso!`)
    }

    const handleSaveNotifications = () => {
        localStorage.setItem('bf_notifications', JSON.stringify(notifications))
        alert("Preferências de notificação salvas!")
    }

    const toggleCard = (id: string) => setActiveCard(activeCard === id ? null : id)

    if (!isLoaded) return null // Prevent mismatch

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground mt-1">
                    Gerencie as configurações globais da plataforma BeautyFlow
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Plataforma e Notificações */}
                <div className="space-y-8">
                    {/* Plataforma */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <CardTitle className="text-lg">Plataforma</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="platformName">Nome</Label>
                                <Input
                                    id="platformName"
                                    value={platformSettings.platformName}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="platformEmail">Email Suporte</Label>
                                <Input
                                    id="platformEmail"
                                    value={platformSettings.platformEmail}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, platformEmail: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="platformDomain">Domínio</Label>
                                <Input
                                    id="platformDomain"
                                    value={platformSettings.platformDomain}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, platformDomain: e.target.value })}
                                />
                            </div>
                            <Button id="save-platform-btn" onClick={handleSavePlatform} className="w-full transition-all">Salvar</Button>
                        </CardContent>
                    </Card>

                    {/* Notificações */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gray-500" />
                                <CardTitle className="text-lg">Alertas</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Nova empresa</Label>
                                <Switch checked={notifications.emailOnNewCompany} onCheckedChange={(c) => setNotifications({ ...notifications, emailOnNewCompany: c })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Pagamento recebido</Label>
                                <Switch checked={notifications.emailOnPaymentReceived} onCheckedChange={(c) => setNotifications({ ...notifications, emailOnPaymentReceived: c })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Falha pagamento</Label>
                                <Switch checked={notifications.emailOnPaymentFailed} onCheckedChange={(c) => setNotifications({ ...notifications, emailOnPaymentFailed: c })} />
                            </div>
                            <Button onClick={handleSaveNotifications} variant="outline" className="w-full">Salvar Alertas</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita: Integrações (Cards Grid) */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Gateways de Pagamento (Cobrança de Assinaturas)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <IntegrationCard
                                id="stripe"
                                title="Stripe"
                                description="Processamento global de cartões"
                                icon={CreditCard}
                                color="bg-indigo-600"
                                isActive={activeCard === 'stripe'}
                                onToggle={() => toggleCard('stripe')}
                                onSave={() => handleSaveIntegration('Stripe')}
                            >
                                <Input
                                    type="password"
                                    placeholder="Secret Key (sk_...)"
                                    value={integrations.stripeApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, stripeApiKey: e.target.value })}
                                />
                            </IntegrationCard>

                            <IntegrationCard
                                id="mercadopago"
                                title="Mercado Pago"
                                description="Líder na América Latina (Pix e Cartão)"
                                icon={CreditCard}
                                color="bg-sky-500"
                                isActive={activeCard === 'mercadopago'}
                                onToggle={() => toggleCard('mercadopago')}
                                onSave={() => handleSaveIntegration('Mercado Pago')}
                            >
                                <Input
                                    type="password"
                                    placeholder="Access Token (APP_USR-...)"
                                    value={integrations.mercadoPagoToken}
                                    onChange={(e) => setIntegrations({ ...integrations, mercadoPagoToken: e.target.value })}
                                />
                            </IntegrationCard>

                            <IntegrationCard
                                id="asaas"
                                title="Asaas"
                                description="Conta digital completa para empresas"
                                icon={CreditCard}
                                color="bg-blue-600"
                                isActive={activeCard === 'asaas'}
                                onToggle={() => toggleCard('asaas')}
                                onSave={() => handleSaveIntegration('Asaas')}
                            >
                                <Input
                                    type="password"
                                    placeholder="API Key ($aact_...)"
                                    value={integrations.asaasApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, asaasApiKey: e.target.value })}
                                />
                            </IntegrationCard>

                            <IntegrationCard
                                id="korvex"
                                title="Korvex Pay"
                                description="Soluções de pagamento personalizadas"
                                icon={CreditCard}
                                color="bg-purple-600"
                                isActive={activeCard === 'korvex'}
                                onToggle={() => toggleCard('korvex')}
                                onSave={() => handleSaveIntegration('Korvex')}
                            >
                                <Input
                                    type="password"
                                    placeholder="API Key"
                                    value={integrations.korvexApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, korvexApiKey: e.target.value })}
                                />
                            </IntegrationCard>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5" /> Inteligência Artificial
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <IntegrationCard
                                id="openai"
                                title="OpenAI"
                                description="GPT-4 para assistentes virtuais"
                                icon={Bot}
                                color="bg-black"
                                isActive={activeCard === 'openai'}
                                onToggle={() => toggleCard('openai')}
                                onSave={() => handleSaveIntegration('OpenAI')}
                            >
                                <Input
                                    type="password"
                                    placeholder="API Key (sk-...)"
                                    value={integrations.openAiApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, openAiApiKey: e.target.value })}
                                />
                            </IntegrationCard>

                            <IntegrationCard
                                id="anthropic"
                                title="Anthropic"
                                description="Claude 3 para análise de texto"
                                icon={Bot}
                                color="bg-orange-600"
                                isActive={activeCard === 'anthropic'}
                                onToggle={() => toggleCard('anthropic')}
                                onSave={() => handleSaveIntegration('Anthropic')}
                            >
                                <Input
                                    type="password"
                                    placeholder="API Key (sk-ant-...)"
                                    value={integrations.anthropicApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, anthropicApiKey: e.target.value })}
                                />
                            </IntegrationCard>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Notas Fiscais e Comms
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <IntegrationCard
                                id="invoice"
                                title="Emissor Fiscal"
                                description="Automação de NFS-e (eNotas/Focus)"
                                icon={FileText}
                                color="bg-green-600"
                                isActive={activeCard === 'invoice'}
                                onToggle={() => toggleCard('invoice')}
                                onSave={() => handleSaveIntegration('Notas Fiscais')}
                            >
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Provedor</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={integrations.invoiceProvider}
                                            onChange={(e) => setIntegrations({ ...integrations, invoiceProvider: e.target.value })}
                                        >
                                            <option value="enotas">eNotas</option>
                                            <option value="focus">Focus NFe</option>
                                        </select>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="API Key"
                                        value={integrations.invoiceApiKey}
                                        onChange={(e) => setIntegrations({ ...integrations, invoiceApiKey: e.target.value })}
                                    />
                                </div>
                            </IntegrationCard>

                            <IntegrationCard
                                id="sendgrid"
                                title="SendGrid"
                                description="Email transacional de alta entrega"
                                icon={Mail}
                                color="bg-blue-500"
                                isActive={activeCard === 'sendgrid'}
                                onToggle={() => toggleCard('sendgrid')}
                                onSave={() => handleSaveIntegration('SendGrid')}
                            >
                                <Input
                                    type="password"
                                    placeholder="API Key (SG...)"
                                    value={integrations.sendgridApiKey}
                                    onChange={(e) => setIntegrations({ ...integrations, sendgridApiKey: e.target.value })}
                                />
                            </IntegrationCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
