import {
  normalizeCPF,
  normalizePhone,
  normalizeEmail,
  parseDate,
  parseDuration,
  parsePrice
} from './validators'

/**
 * Transforma linha do CSV de clientes do Trinks para Customer
 */
export function transformCustomerRow(row: any, tenantId: string): any {
  // Schema Supabase: tenant_id, full_name, email, phone, document, birthdate, notes, status
  const customer: any = {
    tenant_id: tenantId,
    full_name: row['Nome'] || '',
    email: normalizeEmail(row['E-mail']) || null,
    phone: normalizePhone(row['Telefone 1']) || null,
    document: normalizeCPF(row['CPF']) || null,
    status: 'active',
    loyalty_points: 0,
    total_spent: 0,
    marketing_opt_in: true
  }

  // Campos opcionais
  if (row['Data de Nascimento']) {
    const birthDate = parseDate(row['Data de Nascimento'])
    if (birthDate) {
      customer.birthdate = birthDate
    }
  }

  if (row['Observações']) {
    customer.notes = row['Observações']
  }

  if (row['Pontos de Fidelidade']) {
    customer.loyalty_points = parseInt(row['Pontos de Fidelidade']) || 0
  }

  if (row['Último agendamento']) {
    const lastVisit = parseDate(row['Último agendamento'])
    if (lastVisit) {
      customer.last_visit_at = lastVisit
    }
  }

  return customer
}

/**
 * Transforma linha do CSV de serviços do Trinks
 */
export function transformServiceRow(row: any, tenantId: string): any {
  const service: any = {
    tenantId,
    name: row['Nome'] || '',
    description: row['Descrição'] || '',
    durationMinutes: parseDuration(row['Duração']) || 0,
    price: parsePrice(row['Preço Padrão']) || 0,
    currency: 'BRL',
    isActive: true,
    requiresConfirmation: false
  }

  // Categoria
  if (row['Categoria']) {
    service.metadata = {
      ...service.metadata,
      category: row['Categoria']
    }
  }

  // Preço promocional
  if (row['Preço Promocional']) {
    const promoPrice = parsePrice(row['Preço Promocional'])
    if (promoPrice && promoPrice > 0) {
      service.metadata = {
        ...service.metadata,
        promotionalPrice: promoPrice
      }
    }
  }

  return service
}

/**
 * Transforma linha do CSV de profissionais do Trinks
 */
export function transformEmployeeRow(row: any, tenantId: string): any {
  const employee: any = {
    tenantId,
    fullName: row['Nome completo'] || '',
    email: normalizeEmail(row['Email']),
    phone: normalizePhone(row['Telefones']?.split('/')[0]), // pegar primeiro telefone
    role: row['Função'] || 'Profissional',
    status: row['Status'] === 'Ativo' ? 'active' : 'inactive',
    acceptsOnlineBooking: row['Possui agenda'] === 'Sim',
    colorTag: '#6366f1', // cor padrão
    specialties: []
  }

  // CPF
  if (row['CPF']) {
    employee.metadata = {
      ...employee.metadata,
      cpf: normalizeCPF(row['CPF'])
    }
  }

  // Apelido
  if (row['Apelido']) {
    employee.metadata = {
      ...employee.metadata,
      nickname: row['Apelido']
    }
  }

  // Data de nascimento
  if (row['Data de nascimento']) {
    const birthDate = parseDate(row['Data de nascimento'])
    if (birthDate) {
      employee.metadata = {
        ...employee.metadata,
        birthDate
      }
    }
  }

  // Data de início
  if (row['Data Inicio']) {
    const startDate = parseDate(row['Data Inicio'])
    if (startDate) {
      employee.metadata = {
        ...employee.metadata,
        startDate
      }
    }
  }

  // Forma de relação profissional
  if (row['Forma relação profissional']) {
    employee.metadata = {
      ...employee.metadata,
      employmentType: row['Forma relação profissional']
    }
  }

  // Administrador
  if (row['Administrador'] === 'Sim') {
    employee.metadata = {
      ...employee.metadata,
      isAdmin: true
    }
  }

  return employee
}

/**
 * Transforma linha da matriz de comissões para atualizar specialties
 */
export function transformCommissionRow(row: any): {
  employeeName: string
  serviceName: string
  commission: number
} {
  return {
    employeeName: row['Nome'] || row['Apelido'] || '',
    serviceName: row['Serviço'] || '',
    commission: parsePrice(row['Comissão']) || 0
  }
}

/**
 * Transforma Customer para formato de exportação Trinks
 */
export function customerToTrinksFormat(customer: any): any {
  return {
    'CPF': customer.document || '',
    'Origem': 'Sistema',
    'Nome': customer.full_name,
    'Telefone 1': customer.phone,
    'E-mail': customer.email || '',
    'Data de Nascimento': customer.birthdate || '',
    'Observações': customer.notes || '',
    'Pontos de Fidelidade': customer.loyalty_points || 0,
    'CEP': '',
    'Estado': '',
    'Endereço': '',
    'Número': '',
    'Complemento': '',
    'Bairro': '',
    'Cidade': ''
  }
}

/**
 * Transforma ServiceRecord para formato de exportação Trinks
 */
export function serviceToTrinksFormat(service: any): any {
  const hours = Math.floor(service.durationMinutes / 60)
  const mins = service.durationMinutes % 60

  let duration = ''
  if (hours > 0) {
    duration += `${hours}h`
  }
  if (mins > 0) {
    if (hours > 0) duration += ' e '
    duration += `${mins} min`
  }

  return {
    'Nome': service.name,
    'Descrição': service.description || '',
    'Duração': duration,
    'Categoria': service.metadata?.category || '',
    'Tipo de Preço': 'Preço Fixo',
    'Preço Padrão': service.price.toFixed(2).replace('.', ','),
    'Preço Promocional': service.metadata?.promotionalPrice
      ? service.metadata.promotionalPrice.toFixed(2).replace('.', ',')
      : ''
  }
}

/**
 * Transforma EmployeeRecord para formato de exportação Trinks
 */
export function employeeToTrinksFormat(employee: any): any {
  return {
    'Nome completo': employee.fullName,
    'Apelido': employee.metadata?.nickname || '',
    'Email': employee.email,
    'Telefones': employee.phone,
    'CPF': employee.metadata?.cpf || '',
    'Função': employee.role,
    'Status': employee.status === 'active' ? 'Ativo' : 'Inativo',
    'Possui agenda': employee.acceptsOnlineBooking ? 'Sim' : 'Não',
    'Data de nascimento': employee.metadata?.birthDate || '',
    'Data Inicio': employee.metadata?.startDate || '',
    'Forma relação profissional': employee.metadata?.employmentType || '',
    'Administrador': employee.metadata?.isAdmin ? 'Sim' : 'Não'
  }
}
