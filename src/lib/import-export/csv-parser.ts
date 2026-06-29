import Papa from 'papaparse'
import type { ParsedData, ImportEntityType } from '@/types/import'

interface ParseOptions {
  encoding?: string
  delimiter?: string
  skipRows?: number
}

/**
 * Parse CSV com suporte ao formato Trinks
 * - Delimiter: ; (ponto e vírgula)
 * - Encoding: ISO-8859-1
 * - Clientes: cabeçalho na linha 7 (6 linhas de header do relatório)
 */
export async function parseCSV(
  file: File,
  type: ImportEntityType,
  options?: ParseOptions
): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const text = event.target?.result as string

      // Detectar número de linhas a pular baseado no tipo
      const skipRows = options?.skipRows ?? (type === 'clientes' ? 6 : 0)

      // Split em linhas para pular cabeçalho do relatório
      const lines = text.split('\n')
      const dataLines = lines.slice(skipRows).join('\n')

      Papa.parse(dataLines, {
        delimiter: options?.delimiter ?? ';',
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          resolve({
            headers: results.meta.fields || [],
            rows: results.data,
            encoding: options?.encoding,
            delimiter: options?.delimiter ?? ';'
          })
        },
        error: (error: Error) => {
          reject(new Error(`Erro ao fazer parse do CSV: ${error.message}`))
        }
      })
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }

    // Tentar ler como ISO-8859-1 para CSVs do Trinks
    // Se der erro, fallback para UTF-8
    try {
      reader.readAsText(file, options?.encoding ?? 'ISO-8859-1')
    } catch {
      reader.readAsText(file, 'UTF-8')
    }
  })
}

/**
 * Auto-detecta formato do CSV do Trinks baseado nas colunas
 */
export function detectTrinksFormat(headers: string[]): ImportEntityType | null {
  const headerStr = headers.join('|').toLowerCase()

  // Clientes: CPF, Nome, Telefone 1, Data de Nascimento
  if (headerStr.includes('cpf') && headerStr.includes('telefone 1') && headerStr.includes('data de nascimento')) {
    return 'clientes'
  }

  // Serviços: Duração, Categoria, Preço Padrão
  if (headerStr.includes('duração') && headerStr.includes('categoria') && headerStr.includes('preço')) {
    return 'servicos'
  }

  // Profissionais: Nome completo, Apelido, Função
  if (headerStr.includes('nome completo') && headerStr.includes('apelido') && headerStr.includes('função')) {
    return 'profissionais'
  }

  return null
}

/**
 * Exporta dados para CSV no formato Trinks
 */
export function exportToCSV(data: any[], headers: string[], filename: string): void {
  const csv = Papa.unparse({
    fields: headers,
    data
  }, {
    delimiter: ';',
    header: true
  })

  // Converter para ISO-8859-1 (Latin1) para compatibilidade com Trinks
  const latin1 = new Uint8Array(csv.length)
  for (let i = 0; i < csv.length; i++) {
    const charCode = csv.charCodeAt(i)
    // Se o caractere não cabe em Latin1, substitui por '?'
    latin1[i] = charCode > 255 ? 63 : charCode
  }

  // Criar blob com encoding ISO-8859-1
  const blob = new Blob([latin1], { type: 'text/csv;charset=iso-8859-1;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
