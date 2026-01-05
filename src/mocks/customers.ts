export interface Customer {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    password?: string;
    points: number;
    avatar?: string;
    status: 'active' | 'inactive' | 'churned';
    lastVisit: string;
    totalSpent: number;
}

export const mockCustomers: Customer[] = [
    {
        id: '1',
        tenantId: '1',
        name: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        phone: '(11) 99999-1234',
        cpf: '123.456.789-00',
        password: 'password123',
        points: 450,
        avatar: 'https://i.pravatar.cc/150?u=1',
        status: 'active',
        lastVisit: '2023-10-25',
        totalSpent: 1250.00
    },
    {
        id: '4',
        tenantId: '2',
        name: 'Amanda Ferreira',
        email: 'amanda.f@email.com',
        phone: '(11) 96666-3456',
        cpf: '987.654.321-00',
        password: 'password123',
        points: 1200,
        avatar: 'https://i.pravatar.cc/150?u=4',
        status: 'active',
        lastVisit: '2023-10-26',
        totalSpent: 2100.00
    }
];
