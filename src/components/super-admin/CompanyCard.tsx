import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CompanyCardProps {
    company: any
    plan: any
    activationScore: number
    onSuspend: () => void
    onReactivate: () => void
    onDeactivate: () => void
    getStatusBadge: (status: string) => React.ReactNode
}

export function CompanyCard({
    company,
    plan,
    activationScore,
    onSuspend,
    onReactivate,
    onDeactivate,
    getStatusBadge
}: CompanyCardProps) {
    return (
        <Card className="p-4 space-y-3">
            {/* Header with Company Info and Actions */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{company.fullName || company.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{company.email || company.settings?.email}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        {company.status === 'active' && (
                            <DropdownMenuItem onClick={onSuspend}>
                                Suspender
                            </DropdownMenuItem>
                        )}
                        {company.status === 'suspended' && (
                            <DropdownMenuItem onClick={onReactivate}>
                                Reativar
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={onDeactivate}>
                            Desativar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Plano</p>
                    <p className="font-medium">{plan?.name}</p>
                    <p className="text-xs text-muted-foreground">R$ {plan?.price}/mês</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(company.status)}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Funcionários</p>
                    <p className="font-medium">
                        {company.currentEmployees}
                        {company.maxEmployees > 0 && ` / ${company.maxEmployees}`}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Clientes</p>
                    <p className="font-semibold">{company.totalCustomers || 0}</p>
                </div>
            </div>

            {/* Activation Progress */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs text-muted-foreground">Ativação</p>
                    <p className="text-xs font-medium">{activationScore}%</p>
                </div>
                <Progress value={activationScore} className="h-2" />
            </div>

            {/* Revenue */}
            <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Receita Mensal</p>
                <p className="font-semibold text-lg">
                    R$ {company.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </Card>
    )
}
