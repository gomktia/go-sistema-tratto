export interface Company {
    id: string
    name: string
    fullName: string
    email: string
    phone: string
    address: string
    cpfCnpj?: string

    // Branding
    logo?: string
    primaryColor: string
    secondaryColor: string
    customDomain?: string

    // Subscription
    planId: string
    status: 'active' | 'inactive' | 'suspended' | 'trial' | 'pending'
    subscriptionStartDate: string
    subscriptionEndDate: string
    trialEndsAt?: string

    // Limits
    maxEmployees: number
    maxAppointmentsPerMonth: number
    currentEmployees: number
    currentAppointmentsThisMonth: number

    // Financial
    totalRevenue: number
    monthlyRevenue: number

    // Metadata
    createdAt: string
    updatedAt: string
}

export interface Plan {
    id: string
    name: string
    description: string
    price: number
    billingCycle: 'monthly' | 'yearly'

    // Limits
    maxEmployees: number
    maxAppointmentsPerMonth: number

    // Features
    features: string[]

    // Status
    status: 'active' | 'inactive'
    popular?: boolean
}

export interface SubscriptionPayment {
    id: string
    companyId: string
    planId: string
    amount: number
    status: 'paid' | 'pending' | 'failed' | 'refunded'
    dueDate: string
    paidDate?: string
    paymentMethod: 'credit_card' | 'boleto' | 'pix'
    transactionId?: string
}

// Mock data
export const plans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Perfeito para começar',
        price: 97,
        billingCycle: 'monthly',
        maxEmployees: 1,
        maxAppointmentsPerMonth: 100,
        features: [
            'Agenda online',
            'Cadastro de clientes',
            'Relatórios básicos',
            'Suporte por email'
        ],
        status: 'active'
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Para salões em crescimento',
        price: 197,
        billingCycle: 'monthly',
        maxEmployees: 5,
        maxAppointmentsPerMonth: -1, // unlimited
        features: [
            'Tudo do Starter',
            'Agendamentos ilimitados',
            'Até 5 funcionários',
            'Promoções e brindes',
            'Comunicados automáticos',
            'Suporte prioritário'
        ],
        status: 'active',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Para redes e grandes salões',
        price: 497,
        billingCycle: 'monthly',
        maxEmployees: -1, // unlimited
        maxAppointmentsPerMonth: -1, // unlimited
        features: [
            'Tudo do Professional',
            'Funcionários ilimitados',
            'Multi-unidades',
            'API access',
            'Relatórios avançados',
            'Suporte dedicado 24/7',
            'Treinamento personalizado'
        ],
        status: 'active'
    }
]

export const companies: Company[] = [
    {
        id: '1',
        name: 'Beleza Pura',
        fullName: 'Salão Beleza Pura',
        email: 'contato@belezapura.com',
        phone: '(11) 98765-4321',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        logo: 'BP',
        primaryColor: '#8B5CF6',
        secondaryColor: '#A78BFA',
        customDomain: 'belezapura.beautyflow.app',
        planId: 'professional',
        status: 'active',
        subscriptionStartDate: '2024-01-15',
        subscriptionEndDate: '2025-01-15',
        maxEmployees: 5,
        maxAppointmentsPerMonth: -1,
        currentEmployees: 3,
        currentAppointmentsThisMonth: 45,
        totalRevenue: 15420.50,
        monthlyRevenue: 4250.00,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-27T10:00:00Z'
    },
    {
        id: '2',
        name: 'Studio Glamour',
        fullName: 'Studio Glamour Beauty',
        email: 'contato@studioglamour.com',
        phone: '(11) 97654-3210',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        logo: 'SG',
        primaryColor: '#EC4899',
        secondaryColor: '#F472B6',
        customDomain: 'studioglamour.beautyflow.app',
        planId: 'enterprise',
        status: 'active',
        subscriptionStartDate: '2024-02-01',
        subscriptionEndDate: '2025-02-01',
        maxEmployees: -1,
        maxAppointmentsPerMonth: -1,
        currentEmployees: 8,
        currentAppointmentsThisMonth: 120,
        totalRevenue: 28750.00,
        monthlyRevenue: 8900.00,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-12-27T10:00:00Z'
    },
    {
        id: '3',
        name: 'Espaço Elegance',
        fullName: 'Espaço Elegance Spa',
        email: 'contato@elegance.com',
        phone: '(11) 96543-2109',
        address: 'Rua Augusta, 500 - São Paulo, SP',
        logo: 'EE',
        primaryColor: '#06B6D4',
        secondaryColor: '#22D3EE',
        customDomain: 'elegance.beautyflow.app',
        planId: 'starter',
        status: 'trial',
        subscriptionStartDate: '2024-12-20',
        subscriptionEndDate: '2025-01-03',
        trialEndsAt: '2025-01-03',
        maxEmployees: 1,
        maxAppointmentsPerMonth: 100,
        currentEmployees: 1,
        currentAppointmentsThisMonth: 12,
        totalRevenue: 850.00,
        monthlyRevenue: 850.00,
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-27T10:00:00Z'
    }
]
