
export type PlanTier = 'trial' | 'pro' | 'premium' | 'elite';

export interface PlanFeature {
    id: string;
    label: string;
    included: boolean;
    limit?: number | 'unlimited'; // Se numérico, é o limite. Se 'unlimited', sem limite.
}

export interface SubscriptionPlan {
    id: PlanTier;
    name: string;
    price: number;
    description: string;
    features: {
        maxEmployees: number | 'unlimited';
        financialModule: boolean;
        inventoryModule: boolean;
        marketingGallery: boolean;
        fidelityClub: boolean;
        multiUnit: boolean;
        customDomain: boolean;
        supportPriority: 'standard' | 'priority' | 'vip';
    };
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
    trial: {
        id: 'trial',
        name: 'Período de Teste',
        price: 0,
        description: 'Acesso total a todas as funcionalidades por 15 dias.',
        features: {
            maxEmployees: 'unlimited',
            financialModule: true,
            inventoryModule: true,
            marketingGallery: true,
            fidelityClub: true,
            multiUnit: true,
            customDomain: true,
            supportPriority: 'vip'
        }
    },
    pro: {
        id: 'pro',
        name: 'Plano PRO',
        price: 49.90,
        description: 'Essencial para autônomos e pequenos espaços.',
        features: {
            maxEmployees: 2,
            financialModule: false,
            inventoryModule: false,
            marketingGallery: false,
            fidelityClub: false,
            multiUnit: false,
            customDomain: false,
            supportPriority: 'standard'
        }
    },
    premium: {
        id: 'premium',
        name: 'Plano Premium',
        price: 99.90,
        description: 'Para salões em crescimento com gestão completa.',
        features: {
            maxEmployees: 5,
            financialModule: true,
            inventoryModule: true,
            marketingGallery: true,
            fidelityClub: false,
            multiUnit: false,
            customDomain: false,
            supportPriority: 'priority'
        }
    },
    elite: {
        id: 'elite',
        name: 'Plano Elite / Black',
        price: 199.90,
        description: 'Poder total para grandes salões e redes.',
        features: {
            maxEmployees: 'unlimited',
            financialModule: true,
            inventoryModule: true,
            marketingGallery: true,
            fidelityClub: true,
            multiUnit: true,
            customDomain: true,
            supportPriority: 'vip'
        }
    }
};

export const FEATURE_LABELS: Record<keyof SubscriptionPlan['features'], string> = {
    maxEmployees: 'Limite de Profissionais',
    financialModule: 'Gestão Financeira e Comissões',
    inventoryModule: 'Controle de Estoque',
    marketingGallery: 'Galeria e Marketing Personalizado',
    fidelityClub: 'Clube de Fidelidade',
    multiUnit: 'Gestão Multi-Unidades',
    customDomain: 'Domínio Personalizado',
    supportPriority: 'Nível de Suporte'
};

