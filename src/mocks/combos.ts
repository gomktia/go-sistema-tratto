export interface Combo {
    id: string
    tenantId: string
    name: string
    description: string
    items: string[]
    price: number
    originalPrice: number
    category: string
    image: string
}

export const combos: Combo[] = [
    {
        id: "combo-1",
        tenantId: "1",
        name: "Day Spa Beleza Pura",
        description: "Escova + Hidratação + Relax mãos com 15% OFF",
        items: ["Escova Modelada", "Hidratação intensa", "Relax hands"],
        price: 280,
        originalPrice: 330,
        category: "Cabelo & Spa",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&w=500&q=80",
    },
    {
        id: "combo-2",
        tenantId: "1",
        name: "Noiva express",
        description: "Prova de penteado + maquiagem + massagem",
        items: ["Teste de penteado", "Make com Airbrush", "Massagem relaxante"],
        price: 720,
        originalPrice: 820,
        category: "Eventos",
        image: "https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?auto=format&w=500&q=80",
    },
    {
        id: "combo-3",
        tenantId: "2",
        name: "Glow Glamour",
        description: "Design de sobrancelhas + limpeza de pele + máscara LED",
        items: ["Design Sobrancelhas", "Limpeza profunda", "LED Therapy"],
        price: 340,
        originalPrice: 420,
        category: "Estética",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&w=500&q=80",
    }
]
