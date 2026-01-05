"use client"

import { useMemo } from "react"
import { auditEvents } from "@/mocks/audit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useState } from "react"

const roleLabels = {
    super_admin: "Super Admin",
    support: "Suporte",
    system: "Sistema"
}

const statusColors = {
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-red-100 text-red-600"
}

export default function AuditoriaPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredEvents = useMemo(() => {
        return auditEvents.filter(event =>
            event.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.action.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [searchTerm])

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Auditoria & Logs</h2>
                    <p className="text-muted-foreground mt-1">
                        Rastreamento completo de ações críticas em toda a plataforma.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 rounded-full">
                        <Filter className="w-4 h-4" />
                        Filtros avançados
                    </Button>
                    <Button className="gap-2 rounded-full">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Busca por pessoa, empresa ou ação"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evento</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Entidade</TableHead>
                                <TableHead>Detalhes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <p className="font-semibold text-sm">{event.action}</p>
                                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{event.id}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium">{event.actor}</p>
                                        <Badge variant="outline" className="text-[11px] uppercase tracking-widest mt-1">
                                            {roleLabels[event.actorRole]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-semibold">{event.entity}</p>
                                        <p className="text-xs text-muted-foreground">{event.entityType}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {Object.entries(event.metadata).map(([key, value]) => (
                                                <p key={key}><strong>{key}:</strong> {value}</p>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("text-xs", statusColors[event.status])}>
                                            {event.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(event.createdAt).toLocaleString("pt-BR")}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}



