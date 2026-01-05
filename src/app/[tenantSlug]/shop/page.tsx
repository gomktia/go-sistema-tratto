"use client"

import { toast } from "sonner"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ShoppingCart,
    Search,
    Filter,
    ArrowRight,
    Minus,
    Plus,
    Tag,
    ChevronLeft,
    CheckCircle2,
    ShoppingBag,
    Star,
    Info,
    Shield,
    Gift,
    Truck
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn, getInitials } from "@/lib/utils"
import { CustomerTrustBar } from "@/components/CustomerTrustBar"
import { CustomerReviews } from "@/components/CustomerReviews"
import { useTenantBySlug, useTenantProducts, useTenantCombos } from "@/hooks/useTenantRecords"

interface ComboPerk {
    id: string
    title: string
    description: string
    icon: LucideIcon
}

const comboPerks: ComboPerk[] = [
    {
        id: "welcome-gift",
        title: "Brinde exclusivo",
        description: "Mini kit de cuidados para usar em casa.",
        icon: Gift,
    },
    {
        id: "vip-checkin",
        title: "Check-in VIP",
        description: "Atendimento prioritário no dia do combo.",
        icon: Shield,
    },
    {
        id: "easy-transfer",
        title: "Transporte fácil",
        description: "Valet parceiro ou indicação de motorista.",
        icon: Truck,
    },
]

export default function ShopPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const { data: tenant, loading: tenantLoading } = useTenantBySlug(tenantSlug)
    const tenantInitials = useMemo(() => getInitials(tenant?.fullName || tenant?.name || "BeautyFlow"), [tenant?.fullName, tenant?.name])
    const tenantBadge = tenant?.logo || tenantInitials || "BF"
    const tenantId = tenant?.id
    const { data: products } = useTenantProducts(tenantId)
    const { data: tenantCombos } = useTenantCombos(tenantId)

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Todos")
    const [cart, setCart] = useState<{ productId: string, quantity: number }[]>([])
    const [showCheckout, setShowCheckout] = useState(false)
    const [purchaseSuccess, setPurchaseSuccess] = useState(false)
    const [activeCombo, setActiveCombo] = useState<string | null>(null)
    const [customer, setCustomer] = useState<{ name: string, email: string } | null>(null)

    // Check for logged user
    useEffect(() => {
        const email = sessionStorage.getItem('customerEmail')
        if (email) {
            // In a real app we might fetch the name, for now let's try to get from session or default
            // But better, let's fetch quickly
            import("@/lib/supabase/client").then(({ getSupabaseBrowserClient }) => {
                const supabase = getSupabaseBrowserClient()
                supabase?.from('customers').select('full_name, email').eq('email', email).maybeSingle()
                    .then(({ data }) => {
                        if (data) setCustomer({ name: data.full_name, email: data.email })
                    })
            })
        }
    }, [])

    const categories = useMemo(() => {
        const unique = new Set<string>()
        products.forEach(product => {
            if (product.categoryName) unique.add(product.categoryName)
        })
        return ["Todos", ...Array.from(unique)]
    }, [products])

    const selectedCombo = useMemo(
        () => tenantCombos.find(combo => combo.id === activeCombo) ?? null,
        [tenantCombos, activeCombo]
    )

    const filteredProducts = useMemo(() => (
        products.filter(p =>
            (selectedCategory === "Todos" || p.categoryName === selectedCategory) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    ), [products, selectedCategory, searchTerm])

    const featuredProducts = useMemo(() => products.slice(0, 3), [products])

    const productMap = useMemo(() => {
        const map = new Map<string, typeof products[number]>()
        products.forEach(product => map.set(product.id, product))
        return map
    }, [products])

    const addToCart = (productId: string) => {
        const existing = cart.find(item => item.productId === productId)
        if (existing) {
            setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
            setCart([...cart, { productId, quantity: 1 }])
        }
    }

    const removeFromCart = (productId: string) => {
        const item = cart.find(i => i.productId === productId)
        if (item && item.quantity > 1) {
            setCart(cart.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        } else {
            setCart(cart.filter(i => i.productId !== productId))
        }
    }

    const cartTotal = cart.reduce((acc, item) => {
        const product = productMap.get(item.productId)
        return acc + (product?.price || 0) * item.quantity
    }, 0)
    const formattedCartTotal = useMemo(() => cartTotal.toFixed(2), [cartTotal])
    const pixDiscount = useMemo(() => (cartTotal * 0.05).toFixed(2), [cartTotal])
    const totalWithPix = useMemo(() => (cartTotal * 0.95).toFixed(2), [cartTotal])

    const handlePurchase = () => {
        setPurchaseSuccess(true)
        setCart([])
        if (customer) {
            toast.success(`Pedido confirmado para ${customer.name}!`)
        } else {
            toast.success("Pedido realizado com sucesso!")
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    if (!tenant) {
        if (tenantLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Carregando vitrine...</p>
                </div>
            )
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <p className="text-sm text-slate-500 dark:text-zinc-400">Salão não encontrado.</p>
            </div>
        )
    }

    if (purchaseSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            {customer ? `Pedido Confirmado, ${customer.name.split(' ')[0]}!` : "Pedido Realizado!"}
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium">Seus produtos estarão prontos para retirada no salão.</p>
                    </div>
                    <Button
                        onClick={() => router.push(`/${tenantSlug}/profile`)} // To profile!
                        className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg"
                    >
                        Ver detalhes no Perfil
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/book`)} className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary/20">
                            {tenantBadge}
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                {customer ? `Olá, ${customer.name.split(' ')[0]}` : `Shop • ${tenant.name}`}
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                {customer ? "Seus produtos exclusivos" : "Produtos Exclusivos"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar produto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-9 rounded-full bg-slate-100 dark:bg-zinc-800 border-none w-64"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full bg-slate-100 dark:bg-zinc-800"
                            onClick={() => setShowCheckout(true)}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 space-y-10">
                <CustomerTrustBar tenant={tenant} />
                <CustomerReviews tenantName={tenant.fullName} />
                <section className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Combos recomendados</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pacotes favoritos</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Selecione uma experiência pronta e ganhe benefícios extras.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" className="rounded-full border-slate-200 dark:border-zinc-800">
                                Ver todos os combos
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Shield className="w-4 h-4 text-primary" />
                                Garantia BeautyFlow
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tenantCombos.map(combo => (
                            <Card
                                key={combo.id}
                                className={cn(
                                    "rounded-3xl border-2 border-transparent shadow-lg bg-white dark:bg-zinc-900 overflow-hidden flex flex-col md:flex-row transition-all",
                                    activeCombo === combo.id && "border-primary/40 ring-2 ring-primary/20"
                                )}
                            >
                                <div className="md:w-1/3">
                                    <img
                                        src={combo.imageUrl || "https://images.unsplash.com/photo-1502732722413-4b44dfa9b84c?auto=format&w=500&q=80"}
                                        alt={combo.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                    {combo.category && (
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            <Tag className="w-4 h-4" />
                                            {combo.category}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white">{combo.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">{combo.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 line-through">R$ {combo.originalPrice}</p>
                                            <p className="text-2xl font-black text-primary">R$ {combo.price}</p>
                                        </div>
                                        <Button
                                            className="rounded-full px-6"
                                            variant={activeCombo === combo.id ? "default" : "outline"}
                                            onClick={() => setActiveCombo(activeCombo === combo.id ? null : combo.id)}
                                        >
                                            {activeCombo === combo.id ? "Selecionado" : "Adicionar combo"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {selectedCombo && (
                        <Card className="rounded-[2.5rem] border border-primary/20 bg-primary/5 p-6 space-y-5">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Combo selecionado</p>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{selectedCombo.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-zinc-300">{selectedCombo.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 line-through">De R$ {selectedCombo.originalPrice}</p>
                                    <p className="text-3xl font-black text-primary">R$ {selectedCombo.price}</p>
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                {comboPerks.map(perk => {
                                    const Icon = perk.icon
                                    return (
                                        <div
                                            key={perk.id}
                                            className="rounded-2xl border border-white/40 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 p-4 flex gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{perk.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400">{perk.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="text-sm text-slate-500 dark:text-zinc-400">
                                    Programado para {tenant.name}. Confirmação imediata por WhatsApp.
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="rounded-2xl px-6 h-12"
                                        onClick={() => router.push(`/${tenantSlug}/book?combo=${selectedCombo.id}`)}
                                    >
                                        Reservar combo agora
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl px-6 h-12"
                                        onClick={() => setActiveCombo(null)}
                                    >
                                        Escolher outro
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </section>
                <section className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Produtos em destaque</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Mais amados pelos clientes</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featuredProducts.length === 0 && (
                            <Card className="p-4 rounded-3xl border border-white/10 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
                                <p className="text-sm text-slate-500 dark:text-zinc-400">Nenhum produto em destaque no momento.</p>
                            </Card>
                        )}
                        {featuredProducts.map(product => (
                            <Card key={product.id} className="p-4 rounded-3xl border border-white/10 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge className="rounded-full text-[10px] uppercase tracking-widest">
                                        {product.categoryName || "Lançamento"}
                                    </Badge>
                                    <Star className="w-4 h-4 text-amber-400" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">{product.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xl font-black text-primary">R$ {product.price.toFixed(2)}</p>
                                    <Button size="sm" onClick={() => addToCart(product.id)} className="rounded-full px-3">
                                        Adicionar
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
                {/* Hero / Categories */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Categorias</h2>
                        <div className="flex gap-2">
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "rounded-full h-10 px-6 font-bold text-xs uppercase tracking-widest transition-all",
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                                    <div className="aspect-square w-full overflow-hidden relative">
                                        <img
                                            src={product.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&w=500&q=80"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {product.categoryName && (
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-white/80 dark:bg-black/80 backdrop-blur-md text-foreground border-none font-bold text-[10px] uppercase px-3">
                                                    {product.categoryName}
                                                </Badge>
                                            </div>
                                        )}
                                        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            <Info className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{product.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{product.description}</p>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</p>
                                                <p className="text-xl font-black text-primary">R$ {product.price.toFixed(2)}</p>
                                            </div>
                                            <Button
                                                onClick={() => addToCart(product.id)}
                                                size="icon"
                                                className="rounded-2xl w-12 h-12 bg-slate-900 dark:bg-zinc-800 hover:bg-primary text-white transition-all shadow-lg active:scale-95"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </section>
            </main>

            {/* Bottom Checkout Bar */}
            <AnimatePresence>
                {cart.length > 0 && !showCheckout && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50 flex justify-center"
                    >
                        <Button
                            onClick={() => setShowCheckout(true)}
                            className="h-16 px-10 rounded-full bg-slate-900 dark:bg-zinc-800 text-white font-black text-lg shadow-2xl flex items-center gap-4 hover:scale-105 transition-all"
                        >
                            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                                <ShoppingBag className="w-5 h-5" />
                                <span>{cart.reduce((acc, i) => acc + i.quantity, 0)} itens</span>
                            </div>
                            <span>Finalizar Compra • R$ {formattedCartTotal}</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Checkout Drawer (Mock) */}
            <AnimatePresence>
                {showCheckout && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCheckout(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-[70] p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Meu Carrinho</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)} className="rounded-full">
                                    <ChevronLeft className="w-6 h-6 rotate-180" />
                                </Button>
                            </div>

                            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                                {cart.map(item => {
                                    const product = productMap.get(item.productId)
                                    if (!product) return null
                                    return (
                                        <div key={item.productId} className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-zinc-800/50">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                                <img src={product.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&w=500&q=80"} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h4>
                                                    <p className="text-sm font-black text-primary">R$ {product.price},00</p>
                                                </div>
                                                <div className="flex items-center gap-3 self-end">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => addToCart(item.productId)}
                                                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-8 space-y-6 border-t border-slate-100 dark:border-zinc-800 mt-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>R$ {formattedCartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-emerald-500 uppercase tracking-widest">
                                        <span>Desconto Pix</span>
                                        <span>- R$ {pixDiscount}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">Total</p>
                                    <p className="text-4xl font-black text-primary">R$ {totalWithPix}</p>
                                </div>
                                <Button
                                    onClick={handlePurchase}
                                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Pagar Agora com Pix
                                </Button>
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    Retirada disponível em 15 minutos no salão.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
