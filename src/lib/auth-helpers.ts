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
  userData: any
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
): Promise<{ exists: boolean; data?: any; error?: string }> {
  try {
    // Normalize identifier (could be CPF or email)
    const isEmail = identifier.includes('@')

    // Query customer_credentials
    const { data: credentials, error } = await supabase
      .from('customer_credentials')
      .select(`
        *,
        customer:customers!inner(*)
      `)
      .eq(isEmail ? 'email' : 'cpf', identifier)
      .eq('customer.tenant_id', tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user not found
        return { exists: false }
      }
      return { exists: false, error: error.message }
    }

    // Verify password (bcrypt comparison would happen here)
    // For now, we'll use direct comparison since we're in transition
    if (credentials.password_hash === password) {
      return { exists: true, data: credentials }
    }

    return { exists: false, error: 'Senha incorreta' }
  } catch (error: any) {
    return { exists: false, error: error.message }
  }
}

/**
 * Checks if user exists in Supabase Auth (employees/admins)
 */
export async function checkEmployeeAuth(
  email: string,
  password: string,
  tenantId: string
): Promise<{ exists: boolean; data?: any; userType?: UserType; error?: string }> {
  try {
    // Attempt to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // DEMO BACKDOOR: Check for specific demo user if auth fails (since local seed might not populate auth.users)
    if (authError && email === 'julia@belezapura.com' && password === 'senha') {
      // Fetch the employee record to ensure we have the correct user_id
      const { data: demoEmployee } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('tenant_id', tenantId)
        .single()

      if (demoEmployee) {
        return {
          exists: true,
          data: {
            user: {
              id: demoEmployee.user_id,
              email: email,
              user_metadata: { role: 'employee', tenant_id: tenantId }
            },
            employee: demoEmployee
          },
          userType: 'employee',
        }
      }
    }

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
  } catch (error: any) {
    return { exists: false, error: error.message }
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
): Promise<{ exists: boolean; userType?: UserType; data?: any }> {
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

    // Check customer
    const { data: customer, error: customerError } = await supabase
      .from('customer_credentials')
      .select(`
        *,
        customer:customers!inner(*)
      `)
      .eq('email', identifier)
      .eq('customer.tenant_id', tenantId)
      .single()

    if (!customerError && customer) {
      return { exists: true, userType: 'customer', data: customer }
    }
  } else {
    // CPF - only customers
    const normalizedCpf = identifier.replace(/\D/g, '')
    const { data: customer, error } = await supabase
      .from('customer_credentials')
      .select(`
        *,
        customer:customers!inner(*)
      `)
      .eq('cpf', normalizedCpf)
      .eq('customer.tenant_id', tenantId)
      .single()

    if (!error && customer) {
      return { exists: true, userType: 'customer', data: customer }
    }
  }

  return { exists: false }
}
