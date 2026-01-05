export interface Product {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    showOnline: boolean;
    image?: string;
}

export const inventory: Product[] = [
    // Beleza Pura (tenant 1)
    {
        id: '1',
        tenantId: '1',
        name: "Shampoo Premium 500ml",
        description: "Limpeza profunda e hidratação intensa para cabelos danificados.",
        category: "Cabelo",
        price: 85.00,
        stock: 12,
        minStock: 5,
        showOnline: true,
        image: "https://images.unsplash.com/photo-1585232356846-5304bc23668b?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: '2',
        tenantId: '1',
        name: "Condicionador Hidratante",
        description: "Desembaraço imediato e brilho extremo.",
        category: "Cabelo",
        price: 75.00,
        stock: 8,
        minStock: 5,
        showOnline: true,
        image: "https://images.unsplash.com/photo-1594465913000-885226e963bc?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: '3',
        tenantId: '1',
        name: "Esmalte Tons Pastéis",
        description: "Coleção primavera de esmaltes de alta durabilidade.",
        category: "Unhas",
        price: 15.00,
        stock: 45,
        minStock: 10,
        showOnline: true,
        image: "https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&q=80&w=400"
    },

    // Studio Glamour (tenant 2)
    {
        id: '4',
        tenantId: '2',
        name: "Óleo de Barba 30ml",
        description: "Fragrância amadeirada e hidratação para fios rebeldes.",
        category: "Barba",
        price: 55.00,
        stock: 15,
        minStock: 5,
        showOnline: true,
        image: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: '5',
        tenantId: '2',
        name: "Máscara de Reconstrução",
        description: "Tratamento intensivo para fios quimicamente tratados.",
        category: "Cabelo",
        price: 120.00,
        stock: 5,
        minStock: 2,
        showOnline: true,
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400"
    }
];
