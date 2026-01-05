"use client"

import { useState } from "react"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Save, Building2, Clock, Palette } from "lucide-react"

const weekDays = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
]

export default function PerfilPage() {
    const { currentTenant } = useTenant()

    const [basicInfo, setBasicInfo] = useState({
        name: currentTenant.fullName,
        email: "contato@" + currentTenant.name.toLowerCase() + ".com",
        phone: "(11) 99999-9999",
        address: "Rua Exemplo, 123 - Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        description: "Salão de beleza especializado em cortes, coloração e tratamentos capilares."
    })

    const [workingHours, setWorkingHours] = useState({
        monday: { start: '09:00', end: '18:00', closed: false },
        tuesday: { start: '09:00', end: '18:00', closed: false },
        wednesday: { start: '09:00', end: '18:00', closed: false },
        thursday: { start: '09:00', end: '18:00', closed: false },
        friday: { start: '09:00', end: '18:00', closed: false },
        saturday: { start: '09:00', end: '14:00', closed: false },
        sunday: { start: '09:00', end: '14:00', closed: true }
    })

    const [branding, setBranding] = useState({
        primaryColor: currentTenant.primaryColor || '#8B5CF6',
        secondaryColor: currentTenant.secondaryColor || '#A78BFA',
        customDomain: currentTenant.customDomain
    })

    const handleSaveBasicInfo = () => {
        alert("Informações básicas salvas!")
    }

    const handleSaveWorkingHours = () => {
        alert("Horário de funcionamento salvo!")
    }

    const handleSaveBranding = () => {
        alert("Personalização salva!")
    }

    const toggleDay = (day: string) => {
        setWorkingHours(prev => ({
            ...prev,
            [day]: { ...prev[day as keyof typeof prev], closed: !prev[day as keyof typeof prev].closed }
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Perfil da Empresa</h2>
                <p className="text-muted-foreground mt-1">
                    Gerencie as informações e configurações do seu salão
                </p>
            </div>

            {/* Informações Básicas */}
            <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <CardTitle>Informações Básicas</CardTitle>
                    </div>
                    <CardDescription>
                        Dados principais do seu estabelecimento
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Nome do Salão</Label>
                            <Input
                                id="name"
                                value={basicInfo.name}
                                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={basicInfo.email}
                                onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={basicInfo.phone}
                                onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                value={basicInfo.address}
                                onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                                id="city"
                                value={basicInfo.city}
                                onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input
                                id="state"
                                value={basicInfo.state}
                                onChange={(e) => setBasicInfo({ ...basicInfo, state: e.target.value })}
                                maxLength={2}
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={basicInfo.description}
                                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                rows={3}
                                placeholder="Descreva seu salão, especialidades e diferenciais"
                            />
                        </div>
                    </div>

                    <Button onClick={handleSaveBasicInfo}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Informações
                    </Button>
                </CardContent>
            </Card>

            {/* Horário de Funcionamento */}
            <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <CardTitle>Horário de Funcionamento</CardTitle>
                    </div>
                    <CardDescription>
                        Configure os horários de atendimento do seu salão
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {weekDays.map(day => {
                        const hours = workingHours[day.id as keyof typeof workingHours]
                        return (
                            <div key={day.id} className="flex items-center gap-4">
                                <div className="w-32">
                                    <Label className="text-sm">{day.label}</Label>
                                </div>

                                {!hours.closed ? (
                                    <>
                                        <Input
                                            type="time"
                                            value={hours.start}
                                            onChange={(e) => setWorkingHours({
                                                ...workingHours,
                                                [day.id]: { ...hours, start: e.target.value }
                                            })}
                                            className="w-32"
                                        />
                                        <span className="text-muted-foreground">até</span>
                                        <Input
                                            type="time"
                                            value={hours.end}
                                            onChange={(e) => setWorkingHours({
                                                ...workingHours,
                                                [day.id]: { ...hours, end: e.target.value }
                                            })}
                                            className="w-32"
                                        />
                                    </>
                                ) : (
                                    <span className="text-muted-foreground italic">Fechado</span>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleDay(day.id)}
                                >
                                    {hours.closed ? 'Abrir' : 'Fechar'}
                                </Button>
                            </div>
                        )
                    })}

                    <Separator />

                    <Button onClick={handleSaveWorkingHours}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Horários
                    </Button>
                </CardContent>
            </Card>

            {/* Personalização de Marca */}
            <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        <CardTitle>Personalização de Marca</CardTitle>
                    </div>
                    <CardDescription>
                        Customize as cores e identidade visual do seu salão
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Cor Primária</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                    placeholder="#8B5CF6"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Cor Secundária</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="secondaryColor"
                                    type="color"
                                    value={branding.secondaryColor}
                                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={branding.secondaryColor}
                                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                    placeholder="#A78BFA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="customDomain">Domínio Personalizado</Label>
                            <Input
                                id="customDomain"
                                value={branding.customDomain}
                                onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                                placeholder="meusalao.beautyflow.app"
                            />
                            <p className="text-xs text-muted-foreground">
                                Seu link de agendamento online
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="flex gap-2">
                            <div
                                className="w-20 h-20 rounded-lg"
                                style={{ background: `linear-gradient(to br, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                            />
                            <div className="flex-1 flex items-center">
                                <p className="text-sm text-muted-foreground">
                                    Suas cores serão aplicadas em botões, badges e elementos de destaque
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSaveBranding}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Personalização
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
