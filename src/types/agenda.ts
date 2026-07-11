import type { AppointmentStatus } from "./catalog"

export type GridSize = 'PP' | 'P' | 'M' | 'G'

export interface AgendaFilters {
    selectedEmployees: string[]  // IDs dos profissionais ou ["all"]
    selectedServiceCategories: string[]  // IDs das categorias ou ["all"]
    selectedStatuses: AppointmentStatus[]  // Array de status
    accountClosure: 'open' | 'closed'
    gridSize: {
        row: GridSize  // Altura das linhas
        column: GridSize  // Largura das colunas
    }
    showAbsences: boolean
}

export const ROW_HEIGHTS: Record<GridSize, string> = {
    PP: '40px',   // 20min por slot
    P: '60px',    // 30min por slot
    M: '80px',    // 40min por slot
    G: '120px',   // 60min por slot (padrão)
}

export const COLUMN_WIDTHS: Record<GridSize, string> = {
    PP: '120px',
    P: '160px',
    M: '200px',  // padrão atual
    G: '280px',
}

export const DEFAULT_FILTERS: AgendaFilters = {
    selectedEmployees: ['all'],
    selectedServiceCategories: ['all'],
    selectedStatuses: [],
    accountClosure: 'open',
    gridSize: {
        row: 'G',
        column: 'M',
    },
    showAbsences: true,
}
