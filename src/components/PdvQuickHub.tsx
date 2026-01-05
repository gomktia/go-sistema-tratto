"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { services } from "@/mocks/services"
import { inventory } from "@/mocks/inventory"
import { Plus, Minus, CreditCard, Smartphone, Wallet, ArrowRight } from "lucide-react"

interface PdvQuickHubProps {
    tenantId: string
}

type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
}

const paymentOptions = [
    { id: "pix", label: "Pix instantâneo", icon: Smartphone },
    { id: "card", label: "Cartão crédito", icon: CreditCard },
    { id: "cash", label: "Dinheiro / carteira", icon: Wallet },
]

export function PdvQuickHub({ tenantId }: PdvQuickHubProps) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedPay, setSelectedPay] = useState("pix")

    const tenantServices = useMemo(
        () => services.filter((service) => service.tenantId === tenantId).slice(0, 4),
        [tenantId]
    )
    const tenantInventory = useMemo(
        () => inventory.filter((item) => item.tenantId === tenantId).slice(0, 4),
        [tenantId]
    )

    const addItem = (item: { id: string, name: string, price: number }) => {
        setCart((prev) => {
            const exists = prev.find((cartItem) => cartItem.id === item.id)
            if (exists) {
                return prev.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeItem = (itemId: string) => {
        setCart((prev) =>
            prev
                .map((item) => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item)
                .filter((item) => item.quantity > 0)
        )
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">PDV Instantâneo</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Venda rápida no balcão</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Selecione serviços, produtos e finalize o pagamento em segundos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl">Abrir Comanda</Button>
                    <Button className="rounded-xl bg-primary text-white">Enviar Link de Pagamento</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-4">
                    <SectionTitle title="Serviços populares" />
                    <div className="grid grid-cols-2 gap-3">
                        {tenantServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => addItem({ id: `service-${service.id}`, name: service.name, price: service.price })}
                                className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <p className="text-sm font-black text-slate-900 dark:text-white">{service.name}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">R$ {service.price},00 • {service.duration}m</p>
                            </button>
                        ))}
                    </div>

                    <SectionTitle title="Produtos" />
                    <div className="grid grid-cols-2 gap-3">
                        {tenantInventory.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addItem({ id: `product-${product.id}`, name: product.name, price: product.price })}
                                className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">R$ {product.price.toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <SectionTitle title="Itens selecionados" />
                    <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4 space-y-3 min-h-[200px]">
                        {cart.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-10">Nenhum item selecionado. Clique nos cartões ao lado para adicionar.</p>
                        )}
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">R$ {item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700" onClick={() => removeItem(item.id)}>
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700" onClick={() => addItem(item)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-4 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Adicionar item manual</p>
                        <div className="grid gap-2">
                            <Input placeholder="Descrição do serviço/produto" />
                            <Input placeholder="Valor (R$)" type="number" min="0" step="0.01" />
                            <Button variant="outline" className="rounded-xl">Adicionar ao carrinho</Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <SectionTitle title="Pagamento" />
                    <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4 space-y-3">
                        {paymentOptions.map((option) => {
                            const Icon = option.icon
                            const active = selectedPay === option.id
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedPay(option.id)}
                                    className={cn(
                                        "flex items-center justify-between w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                                        active
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 dark:border-zinc-800"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                            active ? "border-primary text-primary" : "border-slate-200 dark:border-zinc-700 text-slate-500"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{option.label}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400">Confirmação em segundos</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <SectionTitle title="Resumo" />
                    <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-gradient-to-br from-slate-900 to-primary/40 text-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-widest text-white/70">Total</p>
                            <span className="text-3xl font-black">R$ {total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">
                            {cart.length} item(s) • Pagamento via {paymentOptions.find((p) => p.id === selectedPay)?.label}
                        </p>

                        <Button className="w-full mt-6 rounded-xl bg-white text-slate-900 hover:bg-white/90 gap-2">
                            Finalizar e emitir recibo
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-slate-200 dark:border-zinc-800">Atualizado</Badge>
        </div>
    )
}



