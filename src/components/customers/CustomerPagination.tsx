'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CustomerPaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function CustomerPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange
}: CustomerPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalCount)

  // Gerar números de página para exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      // Se tiver 7 ou menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar: 1 ... 4 5 6 ... 10
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Páginas ao redor da atual
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          Nenhum cliente encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Info de registros */}
      <p className="text-sm text-muted-foreground">
        Mostrando {startRecord} - {endRecord} de {totalCount} cliente{totalCount !== 1 ? 's' : ''}
      </p>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-9"
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
