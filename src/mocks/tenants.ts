export interface Tenant {
    id: string
    name: string
    fullName: string
    logo: string
    primaryColor: string
    secondaryColor: string
    description: string
    // Branding customization
    customLogo?: string // URL or base64 for uploaded logo
    customPrimaryColor?: string // Custom primary color
    customSecondaryColor?: string // Custom secondary color
    customDomain?: string // Custom domain like "belezapura.beautyflow.app"
    slug: string // Friendly URL identifier like "beleza-pura"
    whatsapp: string // Phone number for WhatsApp contact
    schedulingType: 'individual' | 'shared' // Shared = single room/resource constraint
    settings?: { address?: string;[key: string]: any }
}

export const tenants: Tenant[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Beleza Pura Demo',
        fullName: 'Beleza Pura Demo LTDA',
        logo: 'BP',
        primaryColor: '#8B5CF6', // Purple
        secondaryColor: '#A78BFA',
        description: 'Especializado em tratamentos capilares premium',
        customPrimaryColor: '#8B5CF6',
        customSecondaryColor: '#A78BFA',
        customDomain: 'belezapura-demo.beautyflow.app',
        slug: 'beleza-pura-demo',
        whatsapp: '5511999999999',
        schedulingType: 'individual'
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Studio Glamour',
        fullName: 'Studio Glamour Beauty',
        logo: 'SG',
        primaryColor: '#EC4899', // Pink
        secondaryColor: '#F472B6',
        description: 'Seu destino para beleza e bem-estar',
        customPrimaryColor: '#EC4899',
        customSecondaryColor: '#F472B6',
        customDomain: 'studioglamour.beautyflow.app',
        slug: 'studio-glamour',
        whatsapp: '5511888888888',
        schedulingType: 'shared' // Testing shared mode here
    },
    {
        id: '3',
        name: 'Espaço Elegance',
        fullName: 'Espaço Elegance Spa',
        logo: 'EE',
        primaryColor: '#06B6D4', // Cyan
        secondaryColor: '#22D3EE',
        description: 'Experiência completa de spa e estética',
        customPrimaryColor: '#06B6D4',
        customSecondaryColor: '#22D3EE',
        customDomain: 'elegance.beautyflow.app',
        slug: 'espaco-elegance',
        whatsapp: '5511777777777',
        schedulingType: 'individual'
    }
]

