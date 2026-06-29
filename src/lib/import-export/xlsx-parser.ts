import * as XLSX from 'xlsx'
import type { ParsedData, ImportEntityType } from '@/types/import'

interface ParseOptions {
  skipRows?: number
  sheetName?: string
}

/**
 * Parse XLSX com suporte ao formato Trinks
 */
export async function parseXLSX(
  file: File,
  type: ImportEntityType,
  options?: ParseOptions
): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        // Pegar primeira sheet ou sheet especificada
        const sheetName = options?.sheetName ?? workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false
        }) as any[][]

        if (jsonData.length === 0) {
          reject(new Error('Planilha vazia'))
          return
        }

        // Detectar número de linhas a pular
        const skipRows = options?.skipRows ?? (type === 'clientes' ? 6 : 0)

        // Primeira linha após skip é o header
        const headers = jsonData[skipRows].map((h: any) => String(h).trim())

        // Linhas de dados
        const rows = jsonData.slice(skipRows + 1).map((row) => {
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? String(row[index]).trim() : ''
          })
          return obj
        })

        resolve({
          headers,
          rows
        })
      } catch (error) {
        reject(new Error(`Erro ao fazer parse do XLSX: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Exporta dados para XLSX
 */
export function exportToXLSX(data: any[], headers: string[], filename: string): void {
  // Criar worksheet a partir dos dados
  const ws = XLSX.utils.json_to_sheet(data, { header: headers })

  // Criar workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dados')

  // Gerar arquivo e download
  XLSX.writeFile(wb, filename)
}
