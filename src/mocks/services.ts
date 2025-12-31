export interface Service {
    id: string
    tenantId: string
    name: string
    category: string
    duration: number // em minutos
    price: number
    description: string
    requiresDeposit: boolean
    depositAmount: number
    allowOnlineBooking: boolean
    bufferBefore: number // minutos antes
    bufferAfter: number // minutos depois
    maxClientsPerSlot: number // para serviços em grupo (1 = individual)
    requiredStaff: number // para collective events
    active: boolean
    imageUrl?: string
    createdAt: string
    updatedAt: string
}

export interface Employee {
    id: string
    tenantId: string
    name: string
    email: string
    phone: string
    specialties: string[] // IDs de serviços
    workingHours: {
        [day: string]: { start: string, end: string }[]
    }
    commission: number // porcentagem
    acceptsOnlineBooking: boolean
    roundRobinEnabled: boolean
    active: boolean
    createdAt: string
    updatedAt: string
}

// Mock data de serviços
export const services: Service[] = [
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Corte Feminino',
        category: 'Cabelo',
        duration: 60,
        price: 80,
        description: 'Corte de cabelo feminino com lavagem e finalização',
        requiresDeposit: false,
        depositAmount: 0,
        allowOnlineBooking: true,
        bufferBefore: 5,
        bufferAfter: 10,
        maxClientsPerSlot: 1,
        requiredStaff: 1,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Escova',
        category: 'Cabelo',
        duration: 45,
        price: 60,
        description: 'Escova modeladora',
        requiresDeposit: false,
        depositAmount: 0,
        allowOnlineBooking: true,
        bufferBefore: 5,
        bufferAfter: 5,
        maxClientsPerSlot: 1,
        requiredStaff: 1,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Manicure',
        category: 'Unhas',
        duration: 30,
        price: 35,
        description: 'Manicure completa',
        requiresDeposit: false,
        depositAmount: 0,
        allowOnlineBooking: true,
        bufferBefore: 0,
        bufferAfter: 5,
        maxClientsPerSlot: 1,
        requiredStaff: 1,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '4',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Maquiagem para Noiva',
        category: 'Maquiagem',
        duration: 120,
        price: 250,
        description: 'Maquiagem completa para noivas com teste prévio',
        requiresDeposit: true,
        depositAmount: 100,
        allowOnlineBooking: false,
        bufferBefore: 15,
        bufferAfter: 15,
        maxClientsPerSlot: 1,
        requiredStaff: 2, // Maquiadora + Auxiliar
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1487412947132-28a5d36a9085?auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

// Mock data de funcionários
export const employees: Employee[] = [
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Maria Silva',
        email: 'maria@belezapura.com',
        phone: '(11) 98765-4321',
        specialties: ['1', '2'], // Corte e Escova
        workingHours: {
            'monday': [{ start: '09:00', end: '18:00' }],
            'tuesday': [{ start: '09:00', end: '18:00' }],
            'wednesday': [{ start: '09:00', end: '18:00' }],
            'thursday': [{ start: '09:00', end: '18:00' }],
            'friday': [{ start: '09:00', end: '18:00' }],
            'saturday': [{ start: '09:00', end: '14:00' }]
        },
        commission: 40,
        acceptsOnlineBooking: true,
        roundRobinEnabled: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Ana Costa',
        email: 'ana@belezapura.com',
        phone: '(11) 98765-1234',
        specialties: ['3'], // Manicure
        workingHours: {
            'monday': [{ start: '10:00', end: '19:00' }],
            'tuesday': [{ start: '10:00', end: '19:00' }],
            'wednesday': [{ start: '10:00', end: '19:00' }],
            'thursday': [{ start: '10:00', end: '19:00' }],
            'friday': [{ start: '10:00', end: '19:00' }],
            'saturday': [{ start: '10:00', end: '16:00' }]
        },
        commission: 50,
        acceptsOnlineBooking: true,
        roundRobinEnabled: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Juliana Santos',
        email: 'juliana@belezapura.com',
        phone: '(11) 98765-5678',
        specialties: ['4'], // Maquiagem
        workingHours: {
            'monday': [{ start: '08:00', end: '17:00' }],
            'tuesday': [{ start: '08:00', end: '17:00' }],
            'wednesday': [{ start: '08:00', end: '17:00' }],
            'thursday': [{ start: '08:00', end: '17:00' }],
            'friday': [{ start: '08:00', end: '17:00' }],
            'saturday': [{ start: '08:00', end: '12:00' }]
        },
        commission: 45,
        acceptsOnlineBooking: false,
        roundRobinEnabled: false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]
