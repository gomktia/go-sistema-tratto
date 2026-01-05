
export interface GalleryImage {
    id: string
    tenantId: string
    url: string
    title: string
    description?: string
    category: string
    displayOrder: number
}

export interface Highlight {
    id: string
    tenantId: string
    title: string
    description: string
    imageUrl: string
    type: 'vip_client' | 'promotion' | 'award'
    expiresAt?: string
}

export interface Testimonial {
    id: string
    tenantId: string
    customerName: string
    customerRole?: string // e.g., "Cliente VIP"
    testimonial: string
    rating: number
    imageUrl?: string
    isApproved: boolean
}

export const galleryImages: GalleryImage[] = [
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80',
        title: 'Interior do Salão',
        category: 'space',
        displayOrder: 1
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80',
        title: 'Corte Moderno',
        category: 'hair',
        displayOrder: 2
    },
    {
        id: '3',
        tenantId: '11111111-1111-1111-1111-111111111111',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80',
        title: 'Manicure de Luxo',
        category: 'nails',
        displayOrder: 3
    }
]

export const highlights: Highlight[] = [
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        title: 'Cliente VIP da Semana',
        description: 'Parabéns Maria Silva por completar 50 visitas!',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80',
        type: 'vip_client'
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        title: 'Melhor Salão da Região 2024',
        description: 'Prêmio de excelência em atendimento.',
        imageUrl: 'https://images.unsplash.com/photo-1570172619643-989c49155cc3?auto=format&fit=crop&q=80',
        type: 'award'
    }
]

export const testimonials: Testimonial[] = [
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        customerName: 'Fernanda Lima',
        customerRole: 'Noiva',
        testimonial: 'A equipe fez meu dia mais especial! A maquiagem durou a festa toda.',
        rating: 5,
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
        isApproved: true
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        customerName: 'Carla Dias',
        customerRole: 'Cliente Frequente',
        testimonial: 'O ambiente é super aconchegante e o café é uma delícia.',
        rating: 5,
        isApproved: true
    }
]
