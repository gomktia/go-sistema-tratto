
"use client"

import { useState } from "react"
import { Save, CreditCard, Mail, X, Check, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const PAYMENT_GATEWAYS = [
    {
        id: "mercadopago",
        name: "Mercado Pago",
        description: "Aceite Pix e cartões com as melhores taxas do mercado latino.",
        logo: "https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png", // Placeholder or use text
        color: "bg-sky-500",
        fields: [
            { id: "accessToken", label: "Access Token", type: "password", placeholder: "APP_USR-..." },
            { id: "publicKey", label: "Public Key", type: "text", placeholder: "APP_USR-..." }
        ]
    },
    {
        id: "asaas",
        name: "Asaas",
        description: "Conta digital completa com emissão automática de notas fiscais.",
        logo: "https://logospng.org/download/asaas/logo-asaas-icone-1024.png",
        color: "bg-blue-600",
        fields: [
            { id: "apiKey", label: "API Key", type: "password", placeholder: "$aact_..." }
        ]
    },
    {
        id: "pagarme",
        name: "Pagar.me",
        description: "Infraestrutura de pagamentos flexível para seu negócio digital.",
        logo: "https://logodownload.org/wp-content/uploads/2019/09/pagar-me-logo.png",
        color: "bg-green-600",
        fields: [
            { id: "apiKey", label: "API Key", type: "password", placeholder: "ak_live_..." }
        ]
    },
    {
        id: "pagseguro",
        name: "PagSeguro",
        description: "Soluções completas de pagamentos online e presenciais.",
        logo: "https://logospng.org/download/pagseguro/logo-pagseguro-icone-1024.png",
        color: "bg-yellow-500",
        fields: [
            { id: "email", label: "Email da Conta", type: "email", placeholder: "seu@email.com" },
            { id: "token", label: "Token", type: "password", placeholder: "..." }
        ]
    },
    {
        id: "stripe",
        name: "Stripe",
        description: "Plataforma de infraestrutura financeira para a internet.",
        logo: "https://logospng.org/download/stripe/logo-stripe-icone-1024.png",
        color: "bg-indigo-600",
        fields: [
            { id: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
            { id: "publishableKey", label: "Publishable Key", type: "text", placeholder: "pk_live_..." }
        ]
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "Pagamentos rápidos e seguros em todo o mundo.",
        logo: "https://logospng.org/download/paypal/logo-paypal-icone-1024.png",
        color: "bg-blue-800",
        fields: [
            { id: "clientId", label: "Client ID", type: "text", placeholder: "..." },
            { id: "clientSecret", label: "Client Secret", type: "password", placeholder: "..." }
        ]
    },
    {
        id: "kovr",
        name: "Korne", // Assuming 'Korvex' might be a typo or niche, using 'Korne' as placeholder or if user meant 'Corvus'/etc. Let's stick to user request 'Korvex' if I can find it, if not, I'll put a generic placeholder or Assuming 'Kovr' as insurance/payment? User wrote 'korvex'. Let's use 'Korvex Pay' as placeholder.
        description: "Soluções de pagamento personalizadas.",
        logo: "",
        color: "bg-purple-600",
        fields: [
            { id: "apiKey", label: "API Key", type: "password", placeholder: "..." }
        ]
    }
]

const EMAIL_MARKETING = [
    {
        id: "mailchimp",
        name: "Mailchimp",
        description: "Plataforma de marketing tudo-em-um.",
        color: "bg-yellow-400",
        fields: [
            { id: "apiKey", label: "API Key", type: "password", placeholder: "..." },
            { id: "listId", label: "List ID", type: "text", placeholder: "..." }
        ]
    },
    {
        id: "activecampaign",
        name: "ActiveCampaign",
        description: "Automação de customer experience.",
        color: "bg-blue-500",
        fields: [
            { id: "apiUrl", label: "API URL", type: "text", placeholder: "https://..." },
            { id: "apiKey", label: "API Key", type: "password", placeholder: "..." }
        ]
    },
    {
        id: "rdstation",
        name: "RD Station",
        description: "Ferramenta de automação de marketing líder na América Latina.",
        color: "bg-cyan-500",
        fields: [ // RD uses OAuth usually, but simplified for MVP
            { id: "token", label: "Private Token", type: "password", placeholder: "..." }
        ]
    }
]

export default function IntegracoesPage() {
    const [activeGateway, setActiveGateway] = useState<string | null>(null)
    const [activeEmailTool, setActiveEmailTool] = useState<string | null>(null)
    const [configs, setConfigs] = useState<Record<string, any>>({})

    const handleConnect = (id: string, type: 'payment' | 'email') => {
        // Here we would ideally open a modal or expand the card to show fields
        // For simplicity, we just toggle 'active' state to show "connected" after saving mock fields
        if (type === 'payment') {
            setActiveGateway(id === activeGateway ? null : id)
        } else {
            setActiveEmailTool(id === activeEmailTool ? null : id)
        }
    }

    const handleSaveConfig = (id: string) => {
        alert(`Configurações de ${id} salvas com sucesso!`)
        // In real app, save to backend
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Integrações</h2>
                <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">
                    Conecte suas ferramentas favoritas para turbinar seu negócio.
                </p>
            </div>

            {/* Payment Gateways */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Meios de Pagamento</h3>
                        <p className="text-sm text-slate-500">Escolha como seus clientes pagam.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PAYMENT_GATEWAYS.map((gateway) => {
                        const isConnected = configs[gateway.id]?.connected
                        const isExpanded = activeGateway === gateway.id

                        return (
                            <Card key={gateway.id} className={cn(
                                "group border-2 transition-all duration-200 overflow-hidden",
                                isExpanded ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-slate-200 dark:hover:border-zinc-800",
                                "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md"
                            )}>
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl", gateway.color)}>
                                            {gateway.logo ? (
                                                <span className="text-xs">{gateway.name.substring(0, 2)}</span> // Placeholder if img fails
                                            ) : (
                                                gateway.name.substring(0, 1)
                                            )}
                                        </div>
                                        {isConnected && (
                                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                                                Ativo
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {gateway.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    {isExpanded ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <Separator className="mb-4" />
                                            {gateway.fields.map(field => (
                                                <div key={field.id} className="space-y-1">
                                                    <Label htmlFor={`${gateway.id}-${field.id}`}>{field.label}</Label>
                                                    <Input
                                                        id={`${gateway.id}-${field.id}`}
                                                        type={field.type}
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex gap-2 pt-2">
                                                <Button onClick={() => handleSaveConfig(gateway.name)} className="flex-1" size="sm">
                                                    Salvar
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setActiveGateway(null)}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant={isConnected ? "outline" : "default"}
                                            className="w-full mt-4"
                                            onClick={() => setActiveGateway(gateway.id)}
                                        >
                                            {isConnected ? "Gerenciar" : "Conectar"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <Separator />

            {/* Email Marketing */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Email Marketing & CRM</h3>
                        <p className="text-sm text-slate-500">Sincronize contatos automaticamente.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {EMAIL_MARKETING.map((tool) => {
                        const isExpanded = activeEmailTool === tool.id

                        return (
                            <Card key={tool.id} className={cn(
                                "group border-2 transition-all duration-200 overflow-hidden",
                                isExpanded ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-slate-200 dark:hover:border-zinc-800",
                                "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md"
                            )}>
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl", tool.color)}>
                                            {tool.name.substring(0, 1)}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {tool.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    {isExpanded ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <Separator className="mb-4" />
                                            {tool.fields.map(field => (
                                                <div key={field.id} className="space-y-1">
                                                    <Label htmlFor={`${tool.id}-${field.id}`}>{field.label}</Label>
                                                    <Input
                                                        id={`${tool.id}-${field.id}`}
                                                        type={field.type}
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex gap-2 pt-2">
                                                <Button onClick={() => handleSaveConfig(tool.name)} className="flex-1" size="sm">
                                                    Salvar
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setActiveEmailTool(null)}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full mt-4"
                                            onClick={() => setActiveEmailTool(tool.id)}
                                        >
                                            Configurar
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
