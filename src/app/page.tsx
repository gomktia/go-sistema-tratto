"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Star,
  ChevronRight,
  Play,
  CreditCard,
  Bell,
  MessageSquare,
  Smartphone,
  TrendingUp,
  Clock,
  Package,
  Settings,
  DollarSign,
  Tag,
  Mail,
  PieChart,
  FileText,
  Briefcase,
  UserPlus,
  ShoppingBag,
  Award,
  Target,
  Percent,
  Scissors,
  Heart,
  Gift,
  Share2,
  Instagram,
  Facebook,
  Send,
  Store,
  Megaphone,
  Users2,
  Building2,
  ArrowRightLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const heroStats = [
  { label: "Salões ativos", value: "500+" },
  { label: "Agendamentos/mês", value: "150k+" },
  { label: "Satisfação NPS", value: "96" },
  { label: "ROI médio", value: "340%" },
]

const mainFeatures = [
  {
    title: "Agenda Inteligente",
    description: "Sistema que se adapta ao seu tamanho: 1 profissional ou 100. Identifica disponibilidade automaticamente e maximiza ocupação.",
    icon: Calendar,
    gradient: "from-blue-600 to-indigo-600",
    details: [
      "De 1 a ilimitados profissionais",
      "Gestão automática de salas/espaços",
      "Agendamento online 24/7 para clientes",
      "Lembretes automáticos por WhatsApp",
      "Reduz no-show em até 85%"
    ]
  },
  {
    title: "Portal do Cliente Completo",
    description: "Seus clientes têm um portal exclusivo onde agendam, compram produtos da sua loja, acumulam pontos e recebem suas promoções.",
    icon: Smartphone,
    gradient: "from-purple-600 to-pink-600",
    details: [
      "Agendamento self-service 24/7",
      "Loja online integrada (seus produtos)",
      "Programa de fidelidade automático",
      "Recebe suas promoções e cupons",
      "Histórico completo de atendimentos"
    ]
  },
  {
    title: "Gestão de Equipe Completa",
    description: "Cadastre funcionários, defina horários, salas e comissões. Sistema calcula tudo automaticamente, seja 1 ou 100 profissionais.",
    icon: Users2,
    gradient: "from-green-600 to-emerald-600",
    details: [
      "Cadastro ilimitado de profissionais",
      "Controle de ponto digital",
      "Comissões calculadas automaticamente",
      "Agendas individuais por profissional",
      "Gestão de salas e espaços"
    ]
  },
  {
    title: "Marketing Direto",
    description: "Envie promoções, cupons e ofertas direto para o portal dos seus clientes. Automações inteligentes para aumentar vendas.",
    icon: Megaphone,
    gradient: "from-orange-600 to-red-600",
    details: [
      "Envie promoções para portal do cliente",
      "Cupons de desconto personalizados",
      "Campanhas automáticas de WhatsApp",
      "Recuperação de clientes inativos",
      "Mensagens de aniversário automáticas"
    ]
  },
  {
    title: "Loja Online Integrada",
    description: "Venda produtos online! Seus produtos aparecem no portal do cliente cadastrado. Eles compram direto pelo celular.",
    icon: Store,
    gradient: "from-cyan-600 to-blue-600",
    details: [
      "Catálogo de produtos no portal do cliente",
      "Clientes compram pelo app/site",
      "Controle de estoque automático",
      "Combos e pacotes promocionais",
      "Pagamento online ou presencial"
    ]
  },
  {
    title: "Gestão Financeira Total",
    description: "Fluxo de caixa, comissões, metas e relatórios completos. Veja exatamente quanto cada profissional está faturando.",
    icon: DollarSign,
    gradient: "from-violet-600 to-purple-600",
    details: [
      "Fluxo de caixa em tempo real",
      "Comissões por profissional",
      "Metas e KPIs individuais",
      "PDV rápido e intuitivo",
      "Relatórios gerenciais completos"
    ]
  },
]

const howItWorksSteps = [
  {
    step: "1",
    title: "Você configura seu salão",
    description: "Cadastra seus profissionais (1 ou quantos tiver), define salas, horários e serviços. Sistema se adapta ao seu tamanho.",
    icon: Settings,
    color: "from-blue-600 to-indigo-600"
  },
  {
    step: "2",
    title: "Clientes agendam online 24/7",
    description: "Seus clientes entram no portal, veem horários disponíveis e agendam sozinhos. Sistema identifica automaticamente a disponibilidade.",
    icon: Calendar,
    color: "from-purple-600 to-pink-600"
  },
  {
    step: "3",
    title: "Você vende mais pelo portal",
    description: "Cadastra produtos na loja, manda promoções e cupons. Clientes compram produtos direto pelo portal deles.",
    icon: ShoppingBag,
    color: "from-green-600 to-emerald-600"
  },
  {
    step: "4",
    title: "Sistema gerencia tudo automaticamente",
    description: "Confirmações, lembretes, comissões, estoque e relatórios. Tudo calculado e organizado automaticamente.",
    icon: Zap,
    color: "from-orange-600 to-red-600"
  },
]

const clientPortalFeatures = [
  {
    title: "Agendamento Self-Service",
    description: "Cliente vê horários disponíveis e agenda sozinho, 24/7",
    icon: Calendar
  },
  {
    title: "Loja de Produtos",
    description: "Compra seus produtos online direto pelo portal",
    icon: ShoppingBag
  },
  {
    title: "Programa de Fidelidade",
    description: "Acumula pontos e troca por recompensas",
    icon: Gift
  },
  {
    title: "Recebe Promoções",
    description: "Vê suas ofertas e cupons de desconto exclusivos",
    icon: Tag
  },
  {
    title: "Histórico Completo",
    description: "Acessa histórico de todos atendimentos",
    icon: FileText
  },
  {
    title: "Notificações",
    description: "Recebe lembretes e ofertas personalizadas",
    icon: Bell
  },
]

const businessBenefits = [
  {
    icon: Users2,
    title: "Flexível para qualquer tamanho",
    description: "1 profissional ou 100? Sistema se adapta. Pequeno salão ou rede de franquias.",
    stat: "1 a ∞"
  },
  {
    icon: Store,
    title: "Venda produtos online",
    description: "Seus produtos aparecem no portal do cliente. Vendas automáticas 24/7.",
    stat: "+60%"
  },
  {
    icon: Megaphone,
    title: "Comunicação direta com clientes",
    description: "Envie promoções e cupons direto pro portal. Eles veem na hora.",
    stat: "Tempo real"
  },
  {
    icon: Calendar,
    title: "Agendamentos automáticos",
    description: "Cliente agenda sozinho. Sistema gerencia disponibilidade automaticamente.",
    stat: "75% online"
  },
]

const detailedModules = [
  {
    category: "Gestão de Profissionais",
    icon: Users2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    features: [
      "Cadastro ilimitado de funcionários",
      "Sistema se adapta: 1 ou 100 profissionais",
      "Controle de horários individuais",
      "Gestão de salas/espaços por profissional",
      "Comissões automáticas por pessoa",
      "Metas e performance individual"
    ]
  },
  {
    category: "Portal do Cliente",
    icon: Smartphone,
    color: "text-purple-600",
    bg: "bg-purple-50",
    features: [
      "Cliente agenda online sozinho",
      "Acessa loja de produtos do salão",
      "Vê e usa cupons de desconto",
      "Programa de pontos automático",
      "Recebe suas promoções",
      "Histórico de atendimentos"
    ]
  },
  {
    category: "Marketing & Vendas",
    icon: Megaphone,
    color: "text-pink-600",
    bg: "bg-pink-50",
    features: [
      "Envie promoções pro portal do cliente",
      "Crie cupons de desconto",
      "Campanhas automáticas de WhatsApp",
      "Recuperação de clientes inativos",
      "Mensagens de aniversário",
      "Pesquisas de satisfação"
    ]
  },
  {
    category: "Loja Online",
    icon: Store,
    color: "text-green-600",
    bg: "bg-green-50",
    features: [
      "Catálogo aparece no portal do cliente",
      "Clientes compram online 24/7",
      "Controle de estoque automático",
      "Combos e pacotes promocionais",
      "Pagamento online integrado",
      "Alertas de reposição"
    ]
  },
  {
    category: "Automações Inteligentes",
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    features: [
      "Confirmações automáticas",
      "Lembretes por WhatsApp/SMS",
      "Cálculo de comissões automático",
      "Gestão de disponibilidade",
      "Follow-up pós-atendimento",
      "Reativação de inativos"
    ]
  },
  {
    category: "Gestão Financeira",
    icon: DollarSign,
    color: "text-orange-600",
    bg: "bg-orange-50",
    features: [
      "Fluxo de caixa em tempo real",
      "PDV rápido e intuitivo",
      "Múltiplas formas de pagamento",
      "Comissões por profissional",
      "Relatórios gerenciais",
      "Metas e previsões"
    ]
  },
]

const integrations = [
  { name: "WhatsApp", icon: MessageSquare, color: "text-green-600" },
  { name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { name: "Google", icon: Mail, color: "text-red-600" },
  { name: "Mercado Pago", icon: CreditCard, color: "text-cyan-600" },
]

const benefits = [
  {
    stat: "85%",
    label: "Redução de no-show",
    description: "Com lembretes automáticos via WhatsApp"
  },
  {
    stat: "60%",
    label: "Aumento em vendas de produtos",
    description: "Com loja online no portal do cliente"
  },
  {
    stat: "75%",
    label: "Agendamentos online",
    description: "Clientes agendam sozinhos, sem ligar"
  },
  {
    stat: "4.5x",
    label: "ROI em 6 meses",
    description: "Retorno comprovado por clientes"
  },
]

const defaultPlans = [
  {
    name: "Trial Grátis",
    price: "0",
    period: "15 dias",
    description: "Teste tudo sem compromisso",
    features: [
      "Acesso TOTAL a todas funções",
      "Agendamento Online",
      "Financeiro Completo",
      "Clube de Fidelidade",
      "Sem cartão de crédito"
    ],
    cta: "Criar conta grátis",
    popular: false,
  },
  {
    name: "Pro",
    price: "97,00",
    period: "mês",
    description: "Para profissionais autônomos",
    features: [
      "Até 2 profissionais",
      "Cobrança recorrente (Assinaturas)",
      "Agendamento Online",
      "Lembretes WhatsApp basic",
      "Relatórios básicos"
    ],
    cta: "Assinar Pro",
    popular: false,
  },
  {
    name: "Premium",
    price: "197,00",
    period: "mês",
    description: "Para salões em crescimento",
    features: [
      "Até 5 profissionais",
      "Financeiro Avançado (DRE)",
      "Cálculo de Comissões Automático",
      "Estoque Inteligente",
      "Marketing (E-mail/SMS)",
      "Clube de Fidelidade",
      "Sem taxa de adesão",
    ],
    cta: "Assinar Premium",
    popular: true,
  },
  {
    name: "Elite / Black",
    price: "297,00",
    period: "mês",
    description: "Para grandes redes e franquias",
    features: [
      "Profissionais Ilimitados",
      "Multi-unidades (Franquias)",
      "Domínio Personalizado (.com.br)",
      "Gerente de Conta Exclusivo",
      "API Aberta",
      "White Label (Sua marca)",
    ],
    cta: "Falar com Consultor",
    popular: false,
  },
]

const testimonials = [
  {
    name: "Ana Ferreira",
    role: "Proprietária",
    company: "Studio Ana - 3 profissionais",
    avatar: "AF",
    quote: "O Tratto organizou nosso financeiro de um jeito que nunca vi. O cálculo de comissão automático me economiza 3 dias por mês. Vale cada centavo do Premium.",
    rating: 5,
    metric: "+30% lucro líquido"
  },
  {
    name: "Roberto Silva",
    role: "Dono",
    company: "Barber King - 8 unidades",
    avatar: "RS",
    quote: "Gerencio minhas 8 barbearias em uma tela só. O plano Elite com multi-unidades é perfeito. O cliente tem pontos de fidelidade que valem em qualquer unidade.",
    rating: 5,
    metric: "Gestão centralizada"
  },
  {
    name: "Carla Dias",
    role: "Esteticista",
    company: "Autônoma",
    avatar: "CD",
    quote: "Comecei com o Trial e já fechei o plano Pro. Meus clientes adoram agendar pelo link no Instagram. Simples e chique, combina com meu trabalho.",
    rating: 5,
    metric: "Agenda cheia"
  },
]

const faqs = [
  {
    question: "Funciona para salão pequeno com 1 profissional?",
    answer: "SIM! O sistema se adapta perfeitamente. Se você tem 1 profissional, ele gerencia apenas 1 agenda. Se tem 100, gerencia 100. Você paga pelo plano, não por número de profissionais."
  },
  {
    question: "Como meus clientes veem minha loja de produtos?",
    answer: "Quando o cliente se cadastra no seu salão, ele ganha acesso ao portal dele. Lá dentro ele vê seu catálogo de produtos, pode comprar online e acumular pontos. Tudo integrado!"
  },
  {
    question: "Posso enviar promoções pros meus clientes?",
    answer: "SIM! Você cria promoções e cupons que aparecem automaticamente no portal de cada cliente. Pode também enviar por WhatsApp, email ou SMS. Tudo em poucos cliques."
  },
  {
    question: "Sistema identifica disponibilidade automaticamente?",
    answer: "Sim! Você define os horários de cada profissional e salas disponíveis. O sistema cruza tudo automaticamente e mostra só os horários livres pro cliente agendar."
  },
  {
    question: "Quanto tempo leva para implementar?",
    answer: "De 1 a 3 dias. Você cadastra seus profissionais, serviços e produtos. Nosso time te ajuda no onboarding. Em 1 semana você está vendendo online e recebendo agendamentos automáticos."
  },
  {
    question: "Funciona para rede com várias unidades?",
    answer: "Perfeitamente! Você gerencia todas as unidades em um único painel. Cada uma tem seu catálogo, profissionais e clientes. Relatórios consolidados de tudo."
  },
]

export default function LandingPage() {
  const [plans, setPlans] = useState(defaultPlans)

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const mappedPlans = data.map(p => {
            // Parse JSON fields if they come as strings
            const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
            const features = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || [])

            return {
              name: p.name,
              price: meta.displayPrice || p.price.toString(),
              period: meta.displayPrice ? "" : "mês",
              description: p.description || "",
              features: features,
              cta: meta.cta || "Começar agora",
              popular: meta.popular || false
            }
          })
          setPlans(mappedPlans)
        }
      } catch (err) {
        console.error("Error fetching plans for landing page:", err)
      }
    }

    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Tratto</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Como funciona
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Preços
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Cases
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-900 hover:bg-gray-100">
                Entrar
              </Button>
            </Link>
            <Button size="sm" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30">
              Testar grátis
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none text-xs font-semibold mb-6 shadow-lg">
                ✨ Sistema completo de 1 a infinitos profissionais
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 leading-[1.05]"
            >
              Clientes agendam sozinhos
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">e compram seus produtos</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-normal leading-relaxed"
            >
              Portal exclusivo onde seus clientes <strong>agendam 24/7, veem sua loja de produtos, recebem promoções e acumulam pontos</strong>.
              <br />
              Você gerencia tudo: de 1 a 100 profissionais, salas e unidades.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Button size="lg" className="rounded-full h-14 px-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-semibold gap-2 shadow-2xl shadow-blue-500/40">
                Começar teste grátis 14 dias <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-medium gap-3 group border-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                Ver demonstração
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 max-w-5xl mx-auto"
            >
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-5xl md:text-6xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Business Benefits */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Do pequeno salão à grande rede
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Sistema flexível que cresce com seu negócio
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/10 hover:bg-white/15 transition-all h-full">
                      <Icon className="w-12 h-12 text-blue-400 mb-4" />
                      <div className="text-3xl font-black text-white mb-2">{benefit.stat}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm">{benefit.description}</p>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 border-none text-xs font-semibold mb-4">
                COMO FUNCIONA
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Simples para você.
                <br />
                <span className="text-gray-400">Perfeito para seus clientes.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="text-center">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-6 shadow-xl",
                        item.color
                      )}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="mb-4">
                        <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black text-lg flex items-center justify-center">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                    {index < howItWorksSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-purple-200" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section id="features" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 border-none text-xs font-semibold mb-4">
                RECURSOS COMPLETOS
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Tudo em um só sistema
              </h2>
              <p className="text-xl text-gray-600 font-normal">
                Ferramentas profissionais para gerenciar, vender e crescer
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-8 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white h-full group cursor-pointer overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg relative z-10",
                        feature.gradient
                      )}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2.5">
                        {feature.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Client Portal Features */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-purple-50 text-purple-700 border-none text-xs font-semibold mb-4">
                PORTAL DO CLIENTE
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                O que seus clientes
                <br />
                <span className="text-gray-400">veem e fazem</span>
              </h2>
              <p className="text-xl text-gray-600">
                Cada cliente cadastrado ganha acesso a um portal exclusivo do SEU salão
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientPortalFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-100 hover:shadow-lg transition-all">
                      <Icon className="w-10 h-10 text-purple-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Detailed Modules */}
        <section className="py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-green-50 text-green-700 border-none text-xs font-semibold mb-4">
                MÓDULOS DETALHADOS
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Cada área do seu
                <br />
                negócio coberta
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detailedModules.map((module, index) => {
                const Icon = module.icon
                return (
                  <motion.div
                    key={module.category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-7 bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-5", module.bg)}>
                        <Icon className={cn("w-7 h-7", module.color)} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{module.category}</h3>
                      <ul className="space-y-2.5">
                        {module.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0 mt-1.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits with Stats */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-green-50 text-green-700 border-none text-xs font-semibold mb-4">
                RESULTADOS COMPROVADOS
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                Impacto real no
                <br />
                seu faturamento
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 text-center border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-2xl">
                    <p className="text-6xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      {benefit.stat}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-2">{benefit.label}</p>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-purple-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 border-none text-xs font-semibold mb-4">
                PLANOS E PREÇOS
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                Planos que crescem
                <br />
                com você
              </h2>
              <p className="text-xl text-gray-600">
                Do solo ao time de 100. Escolha seu plano.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(plan.popular && "md:-mt-4")}
                >
                  <Card className={cn(
                    "p-8 bg-white h-full flex flex-col relative overflow-hidden transition-all duration-300",
                    plan.popular
                      ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105"
                      : "border border-gray-200 hover:shadow-xl"
                  )}>
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                    )}
                    {plan.popular && (
                      <Badge className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                        Mais popular
                      </Badge>
                    )}
                    <div className="mb-8">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-6xl font-black text-gray-900">
                          {plan.price === "Custom" ? plan.price : `${plan.price}`}
                        </span>
                        {plan.period && (
                          <span className="text-xl text-gray-500">/{plan.period}</span>
                        )}
                      </div>
                      <p className="text-gray-600 font-medium">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className={cn(
                            "w-5 h-5 flex-shrink-0 mt-0.5",
                            plan.popular ? "text-blue-600" : "text-green-600"
                          )} />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full rounded-full h-14 font-bold text-base",
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      )}
                    >
                      {plan.cta}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600">
                Todos os planos incluem • <strong>Teste grátis 14 dias</strong> • <strong>Sem cartão</strong> • <strong>Cancele quando quiser</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="rounded-full px-4 py-1.5 bg-purple-50 text-purple-700 border-none text-xs font-semibold mb-4">
                CASES REAIS
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                Funciona para todos
                <br />
                <span className="text-gray-400">os tamanhos</span>
              </h2>
              <p className="text-xl text-gray-600">
                De 1 profissional a redes com dezenas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white h-full flex flex-col">
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed flex-1 font-medium">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-xs text-gray-500">{testimonial.company}</p>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-none font-bold whitespace-nowrap">
                        {testimonial.metric}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="rounded-full px-4 py-1.5 bg-gray-100 text-gray-700 border-none text-xs font-semibold mb-4">
                PERGUNTAS FREQUENTES
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Dúvidas? Respondemos.
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-6 border border-gray-200 hover:border-blue-500 transition-all bg-white">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                Pronto para vender mais
                <br />
                trabalhando menos?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-normal">
                Comece hoje. Seus clientes agendando sozinhos e comprando produtos online.
                <br />
                <strong className="text-white">14 dias grátis</strong>, sem cartão de crédito.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button size="lg" className="rounded-full h-16 px-12 bg-white hover:bg-gray-100 text-gray-900 text-lg font-bold gap-2 shadow-2xl">
                  Começar teste grátis <ArrowRight className="w-6 h-6" />
                </Button>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="rounded-full h-16 px-12 text-white hover:bg-white/10 text-lg font-semibold border-2 border-white/20">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>Sem cartão</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Tratto</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                Sistema completo para salões: clientes agendam sozinhos, compram produtos e você gerencia tudo em um só lugar.
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-all group">
                  <Instagram className="w-5 h-5 text-gray-600 group-hover:text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-all group">
                  <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-all group">
                  <Send className="w-5 h-5 text-gray-600 group-hover:text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wider">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Recursos</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Preços</a></li>
                <li><a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Como funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wider">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Sobre</a></li>
                <li><a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Cases</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wider">Suporte</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Central de ajuda</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">WhatsApp</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2024 Tratto. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Privacidade</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Termos</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


