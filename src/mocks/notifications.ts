export interface Notification {
    id: string
    type: 'appointment' | 'payment' | 'system' | 'reminder'
    title: string
    message: string
    read: boolean
    createdAt: string
    link?: string
}

export const notifications: Notification[] = [
    {
        id: '1',
        type: 'appointment',
        title: 'Novo Agendamento',
        message: 'Maria Silva agendou Corte Feminino para hoje às 14:00',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        link: '/agenda'
    },
    {
        id: '2',
        type: 'reminder',
        title: 'Lembrete de Agendamento',
        message: 'Ana Costa tem agendamento em 1 hora',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        link: '/agenda'
    },
    {
        id: '3',
        type: 'payment',
        title: 'Pagamento Recebido',
        message: 'Pagamento de R$ 80,00 confirmado - Juliana Santos',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '4',
        type: 'system',
        title: 'Atualização do Sistema',
        message: 'Nova funcionalidade de intervalos automáticos disponível',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
]
