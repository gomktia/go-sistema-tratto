export const services = [
    // Beleza Pura (tenant 1)
    // Beleza Pura (tenant 1)
    { id: 'a1111111-1111-1111-1111-111111111111', tenantId: '11111111-1111-1111-1111-111111111111', name: 'Corte Feminino', duration: 60, price: 120, category: 'Cabelo' },
    { id: 'a1111111-1111-1111-1111-111111111112', tenantId: '11111111-1111-1111-1111-111111111111', name: 'Coloração', duration: 120, price: 250, category: 'Cabelo' },
    { id: 'a1111111-1111-1111-1111-111111111113', tenantId: '11111111-1111-1111-1111-111111111111', name: 'Manicure', duration: 45, price: 40, category: 'Unhas' },
    { id: 'a1111111-1111-1111-1111-111111111114', tenantId: '11111111-1111-1111-1111-111111111111', name: 'Design de Sobrancelhas', duration: 30, price: 45, category: 'Sobrancelhas' },
    { id: 'a1111111-1111-1111-1111-111111111115', tenantId: '11111111-1111-1111-1111-111111111111', name: 'Mechas', duration: 240, price: 450, category: 'Cabelo' },

    // Studio Glamour (tenant 2)
    { id: '6', tenantId: '2', name: 'Corte Feminino Premium', duration: 60, price: 150, category: 'Cabelo' },
    { id: '7', tenantId: '2', name: 'Maquiagem Profissional', duration: 90, price: 200, category: 'Maquiagem' },
    { id: '8', tenantId: '2', name: 'Design de Sobrancelhas', duration: 30, price: 60, category: 'Sobrancelhas' },
    { id: '9', tenantId: '2', name: 'Alongamento de Unhas', duration: 90, price: 120, category: 'Unhas' },

    // Espaço Elegance (tenant 3)
    { id: '10', tenantId: '3', name: 'Massagem Relaxante', duration: 60, price: 180, category: 'Spa' },
    { id: '11', tenantId: '3', name: 'Limpeza de Pele', duration: 90, price: 220, category: 'Estética' },
    { id: '12', tenantId: '3', name: 'Drenagem Linfática', duration: 60, price: 150, category: 'Spa' },
]

export const staff = [
    // Beleza Pura (tenant 1)
    { id: '1', tenantId: '1', name: 'Ana Silva', specialties: ['Cabelo'], avatar: 'https://i.pravatar.cc/150?u=a' },
    { id: '2', tenantId: '1', name: 'Julia Costa', specialties: ['Unhas'], avatar: 'https://i.pravatar.cc/150?u=b' },
    { id: '3', tenantId: '1', name: 'Mariana Santos', specialties: ['Cabelo', 'Maquiagem'], avatar: 'https://i.pravatar.cc/150?u=c' },

    // Studio Glamour (tenant 2)
    { id: '4', tenantId: '2', name: 'Camila Rodrigues', specialties: ['Maquiagem'], avatar: 'https://i.pravatar.cc/150?u=d' },
    { id: '5', tenantId: '2', name: 'Beatriz Alves', specialties: ['Cabelo', 'Sobrancelhas'], avatar: 'https://i.pravatar.cc/150?u=e' },

    // Espaço Elegance (tenant 3)
    { id: '6', tenantId: '3', name: 'Larissa Mendes', specialties: ['Spa', 'Estética'], avatar: 'https://i.pravatar.cc/150?u=f' },
    { id: '7', tenantId: '3', name: 'Rafaela Oliveira', specialties: ['Estética'], avatar: 'https://i.pravatar.cc/150?u=g' },
]

export const appointments = [
    // Beleza Pura (tenant 1)
    // Beleza Pura (tenant 1)
    {
        id: '1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        customer: 'Fernanda Lima',
        serviceId: 'a1111111-1111-1111-1111-111111111111', // Corte Feminino
        staffId: 'e1111111-1111-1111-1111-111111111111', // Julia Santos
        date: new Date().toISOString(), // Today
        time: '09:00',
        status: 'confirmed',
        duration: 60
    },
    {
        id: '2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        customer: 'Beatriz Souza',
        serviceId: 'a1111111-1111-1111-1111-111111111113', // Manicure
        staffId: 'e1111111-1111-1111-1111-111111111111', // Julia Santos (helping out?)
        date: new Date().toISOString(),
        time: '14:30',
        status: 'scheduled',
        duration: 45
    },
    {
        id: '3',
        tenantId: '11111111-1111-1111-1111-111111111111',
        customer: 'Carla Dias',
        serviceId: 'a1111111-1111-1111-1111-111111111112', // Progressiva
        staffId: 'e1111111-1111-1111-1111-111111111111', // Julia Santos
        date: new Date().toISOString(),
        time: '16:00',
        status: 'confirmed',
        duration: 120
    },

    // Studio Glamour (tenant 2)
    {
        id: '4',
        tenantId: '2',
        customer: 'Amanda Ferreira',
        serviceId: '7',
        staffId: '4',
        date: new Date().toISOString(),
        time: '11:00',
        status: 'confirmed',
        duration: 90
    },
    {
        id: '5',
        tenantId: '2',
        customer: 'Isabela Martins',
        serviceId: '8',
        staffId: '5',
        date: new Date().toISOString(),
        time: '15:30',
        status: 'scheduled',
        duration: 30
    },

    // Espaço Elegance (tenant 3)
    {
        id: '6',
        tenantId: '3',
        customer: 'Gabriela Santos',
        serviceId: '10',
        staffId: '6',
        date: new Date().toISOString(),
        time: '10:00',
        status: 'confirmed',
        duration: 60
    },
]

export const stats = [
    { label: "Faturamento Dia", value: "R$ 1.250,00", trend: "+12%" },
    { label: "Agendamentos", value: "14", trend: "+5%" },
    { label: "Ticket Médio", value: "R$ 89,00", trend: "-2%" },
    { label: "Novos Clientes", value: "3", trend: "+15%" },
]

export const clients = [
    // Beleza Pura (tenant 1)
    {
        id: 'c1111111-1111-1111-1111-111111111111',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        phone: '(11) 99999-1234',
        lastVisit: '2023-10-25',
        totalSpent: 1250.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=1'
    },
    {
        id: 'c1111111-1111-1111-1111-111111111112',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Beatriz Souza',
        email: 'bea.souza@email.com',
        phone: '(11) 98888-5678',
        lastVisit: '2023-10-20',
        totalSpent: 450.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=2'
    },
    {
        id: 'c1111111-1111-1111-1111-111111111113',
        tenantId: '11111111-1111-1111-1111-111111111111',
        name: 'Carla Dias',
        email: 'carla.dias@email.com',
        phone: '(11) 97777-9012',
        lastVisit: '2023-09-15',
        totalSpent: 890.00,
        status: 'inactive',
        avatar: 'https://i.pravatar.cc/150?u=3'
    },

    // Studio Glamour (tenant 2)
    {
        id: '4',
        tenantId: '2',
        name: 'Amanda Ferreira',
        email: 'amanda.f@email.com',
        phone: '(11) 96666-3456',
        lastVisit: '2023-10-26',
        totalSpent: 2100.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=4'
    },
    {
        id: '5',
        tenantId: '2',
        name: 'Isabela Martins',
        email: 'isa.martins@email.com',
        phone: '(11) 95555-7890',
        lastVisit: '2023-10-24',
        totalSpent: 850.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=5'
    },
    {
        id: '6',
        tenantId: '2',
        name: 'Carolina Rocha',
        email: 'carol.rocha@email.com',
        phone: '(11) 94444-2345',
        lastVisit: '2023-09-10',
        totalSpent: 320.00,
        status: 'inactive',
        avatar: 'https://i.pravatar.cc/150?u=6'
    },

    // Espaço Elegance (tenant 3)
    {
        id: '7',
        tenantId: '3',
        name: 'Gabriela Santos',
        email: 'gabi.santos@email.com',
        phone: '(11) 93333-6789',
        lastVisit: '2023-10-27',
        totalSpent: 1580.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=7'
    },
    {
        id: '8',
        tenantId: '3',
        name: 'Juliana Pereira',
        email: 'ju.pereira@email.com',
        phone: '(11) 92222-4567',
        lastVisit: '2023-10-22',
        totalSpent: 920.00,
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=8'
    },
    {
        id: '9',
        tenantId: '3',
        name: 'Letícia Barbosa',
        email: 'leticia.b@email.com',
        phone: '(11) 91111-8901',
        lastVisit: '2023-08-15',
        totalSpent: 450.00,
        status: 'churned',
        avatar: 'https://i.pravatar.cc/150?u=9'
    }
]

