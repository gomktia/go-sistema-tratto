/**
 * Authentication Helper Functions
 * Handles intelligent user detection for multi-role login system
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserType = 'customer' | 'employee' | 'company_admin' | 'super_admin'

export interface AuthResult {
  success: boolean
  userType: UserType | null
  userData: unknown
  redirectPath: string
  error?: string
}

/**
 * Checks if user exists in customer_credentials table
 */
export async function checkCustomerAuth(
  identifier: string,
  password: string,
  tenantId: string
): Promise<{ exists: boolean; data?: unknown; error?: string }> {
  try {
    // Autenticação server-side: o secret_hash nunca viaja ao browser.
    // A comparação bcrypt é feita na rota /api/auth/customer-login.
    const res = await fetch('/api/auth/customer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, tenantId }),
    })

    if (!res.ok) {
      return { exists: false, error: 'Erro ao autenticar' }
    }

    const result = await res.json()
    if (result.exists) {
      return { exists: true, data: result.data }
    }

    return { exists: false, error: result.error || 'Credenciais inválidas' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { exists: false, error: message }
  }
}

/**
 * Checks if user exists in Supabase Auth (employees/admins)
 */
export async function checkEmployeeAuth(
  email: string,
  password: string,
  tenantId: string
): Promise<{ exists: boolean; data?: unknown; userType?: UserType; error?: string }> {
  try {
    // Attempt to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { exists: false, error: authError.message }
    }

    if (!authData.user) {
      return { exists: false, error: 'Usuário não encontrado' }
    }

    // Check user role and tenant association
    const userMetadata = authData.user.user_metadata
    const role = userMetadata.role as UserType

    // Super admins have access everywhere
    if (role === 'super_admin') {
      return {
        exists: true,
        data: authData,
        userType: 'super_admin',
      }
    }

    // Check if user belongs to this tenant
    if (userMetadata.tenant_id !== tenantId) {
      // User exists but not for this tenant
      await supabase.auth.signOut()
      return { exists: false, error: 'Usuário não pertence a este salão' }
    }

    // Check if user is employee
    if (role === 'employee') {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('tenant_id', tenantId)
        .single()

      if (employeeError || !employee) {
        await supabase.auth.signOut()
        return { exists: false, error: 'Profissional não encontrado' }
      }

      return {
        exists: true,
        data: { ...authData, employee },
        userType: 'employee',
      }
    }

    // Check if user is company admin
    if (role === 'company_admin') {
      return {
        exists: true,
        data: authData,
        userType: 'company_admin',
      }
    }

    return { exists: false, error: 'Tipo de usuário inválido' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { exists: false, error: message }
  }
}

/**
 * Intelligent login function that checks both customer and employee/admin systems
 * Priority: Employee/Admin > Customer (employees can also be customers)
 */
export async function intelligentLogin(
  identifier: string,
  password: string,
  tenantId: string
): Promise<AuthResult> {
  // If identifier is email, check employee/admin first
  if (identifier.includes('@')) {
    // Try employee/admin authentication
    const employeeResult = await checkEmployeeAuth(identifier, password, tenantId)

    if (employeeResult.exists) {
      // Determine redirect path based on user type
      let redirectPath = '/'

      switch (employeeResult.userType) {
        case 'super_admin':
          redirectPath = '/super-admin/dashboard'
          break
        case 'company_admin':
          redirectPath = '/dashboard'
          break
        case 'employee':
          redirectPath = '/profissional/agenda'
          break
      }

      return {
        success: true,
        userType: employeeResult.userType!,
        userData: employeeResult.data,
        redirectPath,
      }
    }

    // If not found as employee/admin, try as customer
    const customerResult = await checkCustomerAuth(identifier, password, tenantId)

    if (customerResult.exists) {
      return {
        success: true,
        userType: 'customer',
        userData: customerResult.data,
        redirectPath: `/profile`,
      }
    }

    // User not found in either system
    return {
      success: false,
      userType: null,
      userData: null,
      redirectPath: '',
      error: employeeResult.error || customerResult.error || 'Usuário não encontrado',
    }
  }

  // If identifier is CPF, it can only be a customer
  const customerResult = await checkCustomerAuth(identifier, password, tenantId)

  if (customerResult.exists) {
    return {
      success: true,
      userType: 'customer',
      userData: customerResult.data,
      redirectPath: `/profile`,
    }
  }

  return {
    success: false,
    userType: null,
    userData: null,
    redirectPath: '',
    error: customerResult.error || 'Cliente não encontrado',
  }
}

/**
 * Check if user exists (without password verification)
 * Used in the identification step
 */
export async function checkUserExists(
  identifier: string,
  tenantId: string
): Promise<{ exists: boolean; userType?: UserType; data?: unknown }> {
  const isEmail = identifier.includes('@')

  if (isEmail) {
    // Check employee first by querying employees table
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        app_user:app_users(full_name)
      `)
      .eq('email', identifier)
      .eq('tenant_id', tenantId)
      .single()

    if (!employeeError && employee) {
      return {
        exists: true,
        userType: 'employee',
        data: {
          full_name: employee.app_user?.full_name || employee.name,
          email: employee.email,
          ...employee
        }
      }
    }

    // Check customer — sem expor secret_hash; usa colunas reais do schema
    const { data: customer, error: customerError } = await supabase
      .from('customer_credentials')
      .select(`
        id,
        identity_type,
        identity_value,
        customer:customers!inner(id, full_name, email, phone, status, tenant_id)
      `)
      .eq('identity_type', 'email')
      .eq('identity_value', identifier.toLowerCase().trim())
      .eq('tenant_id', tenantId)
      .single()

    if (!customerError && customer) {
      const c = customer.customer as unknown as Record<string, unknown>
      return {
        exists: true,
        userType: 'customer',
        data: { full_name: c.full_name, email: c.email, ...c }
      }
    }
  } else {
    // CPF — somente clientes
    const normalizedCpf = identifier.replace(/\D/g, '')
    const { data: customer, error } = await supabase
      .from('customer_credentials')
      .select(`
        id,
        identity_type,
        identity_value,
        customer:customers!inner(id, full_name, email, phone, status, tenant_id)
      `)
      .eq('identity_type', 'cpf')
      .eq('identity_value', normalizedCpf)
      .eq('tenant_id', tenantId)
      .single()

    if (!error && customer) {
      const c = customer.customer as unknown as Record<string, unknown>
      return {
        exists: true,
        userType: 'customer',
        data: { full_name: c.full_name, email: c.email, ...c }
      }
    }
  }

  // Fallback: verificar no Supabase Auth (detecta company_admin e super_admin
  // que não aparecem nas tabelas employees ou customer_credentials)
  if (isEmail) {
    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.exists) {
          return {
            exists: true,
            userType: result.userType as UserType,
            data: result.data,
          }
        }
      }
    } catch {
      // fallback silencioso — se a rota falhar, segue o fluxo normal
    }
  }

  return { exists: false }
}

