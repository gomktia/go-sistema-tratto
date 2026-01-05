"use client"

import { useState, useMemo } from "react"
import { invoices, type Invoice } from "@/mocks/invoices"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
    FileText,
    Play,
    PauseCircle,
    AlertTriangle,
    RefreshCw,
    Search
} from "lucide-react"

const statusColors = {
    paid: "bg-emerald-100 text-emerald-600",
    pending: "bg-blue-100 text-blue-600",
    failed: "bg-red-100 text-red-600",
    overdue: "bg-amber-100 text-amber-600",
    refunded: "bg-gray-100 text-gray-600"
}

export default function CobrancasPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice =>
                invoice.companyName.toLowerCase().includes(search.toLowerCase()) ||
                invoice.id.toLowerCase().includes(search.toLowerCase())
            )
            .filter(invoice => statusFilter === "all" || invoice.status === statusFilter)
    }, [search, statusFilter])

    const kpis = useMemo(() => {
        const total = invoices.length
        const paid = invoices.filter(i => i.status === "paid").length
        const overdue = invoices.filter(i => i.status === "overdue").length
        return {
            total,
            paid,
            overdue,
            successRate: total ? Math.round((paid / total) * 100) : 0
        }
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Cobranças</h2>
                    <p className="text-muted-foreground mt-1">
                        Controle total de invoices, tentativas e dunning.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full gap-2">
                        <Play className="w-4 h-4" />
                        Agendar Playbook
                    </Button>
                    <Button className="rounded-full gap-2">
                        <FileText className="w-4 h-4" />
                        Gerar Relatório
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Invoices gerados" value={invoices.length} />
                <KpiCard title="Taxa de sucesso" value={`${kpis.successRate}%`} />
                <KpiCard title="Pagos" value={kpis.paid} />
                <KpiCard title="Em atraso" value={kpis.overdue} />
            </div>

            <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader>
                    <CardTitle>Invoice recentes</CardTitle>
                    <CardDescription>Acompanhamento e ações rápidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por empresa ou invoice"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="paid">Pagos</SelectItem>
                                <SelectItem value="pending">Pendentes</SelectItem>
                                <SelectItem value="overdue">Atrasados</SelectItem>
                                <SelectItem value="failed">Falhos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Retentativas</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-semibold">{invoice.id}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{invoice.companyName}</p>
                                        <p className="text-xs text-muted-foreground">{invoice.planId}</p>
                                    </TableCell>
                                    <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell className="capitalize">{invoice.method}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("text-xs", statusColors[invoice.status])}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell>{invoice.attempts}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Button variant="outline" size="sm" className="rounded-full"
                                                onClick={() => setSelectedInvoice(invoice)}>
                                                Ver detalhes
                                            </Button>
                                            {invoice.status === "overdue" && (
                                                <Button size="sm" className="rounded-full">
                                                    Reenviar boleto
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
                {selectedInvoice && (
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Invoice {selectedInvoice.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{selectedInvoice.companyName}</p>
                                <Badge className={cn(statusColors[selectedInvoice.status], "uppercase text-[10px]")}>
                                    {selectedInvoice.status}
                                </Badge>
                            </div>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <p><strong>Valor:</strong> R$ {selectedInvoice.amount.toFixed(2)}</p>
                                <p><strong>Método:</strong> {selectedInvoice.method}</p>
                                <p><strong>Vencimento:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Retentativas</p>
                                <Progress value={selectedInvoice.attempts * 20} />
                                <p className="text-xs text-muted-foreground">Última tentativa: {selectedInvoice.lastAttemptAt ? new Date(selectedInvoice.lastAttemptAt).toLocaleString("pt-BR") : "N/A"}</p>
                            </div>
                            <Textarea placeholder="Notas ou justificativa (ex.: cliente solicitou prorrogação)" />
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Tentar novamente
                                </Button>
                                <Button variant="destructive" className="gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Aplicar bloqueio
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}

function KpiCard({ title, value }: { title: string, value: string | number }) {
    return (
        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
            <CardContent className="py-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
            </CardContent>
        </Card>
    )
}


