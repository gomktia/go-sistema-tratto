# Sistema de Login Inteligente

## Visão Geral

O BeautyFlow implementa um **sistema de login inteligente** que detecta automaticamente o tipo de usuário (Cliente, Profissional, Gerente ou Super Admin) e direciona para a área apropriada.

## Como Funciona

### 1. Detecção Automática de Usuário

Quando um usuário faz login em `/{tenantSlug}/login` (ex: `/beleza-pura/login`), o sistema:

1. **Verifica se o identificador é email ou CPF**
   - CPF → Apenas clientes podem usar
   - Email → Pode ser cliente, profissional, gerente ou super admin

2. **Para emails, busca em ordem de prioridade:**
   - ✅ **Profissional/Gerente** (tabela `employees` + `auth.users`)
   - ✅ **Cliente** (tabela `customer_credentials`)

3. **Exibe o tipo de usuário detectado com badge colorido:**
   - 🟦 **Cliente** (azul)
   - 🟪 **Profissional** (roxo)
   - 🟩 **Gerente** (verde)
   - 🟥 **Admin** (vermelho)

### 2. Regras de Prioridade

Se um email existe em **ambos os sistemas** (profissional E cliente):
- ✅ **Prioridade para Profissional/Gerente**
- O usuário faz login como profissional
- Pode alternar para "Modo Cliente" no dashboard

### 3. Redirecionamentos Inteligentes

Após login bem-sucedido, o usuário é direcionado para:

| Tipo de Usuário | Redirect Path |
|----------------|---------------|
| Cliente | `/{tenantSlug}/profile` |
| Profissional | `/{tenantSlug}/profissional/dashboard` |
| Gerente (Company Admin) | `/dashboard` |
| Super Admin | `/super-admin/dashboard` |

## Modo Dual para Profissionais

### O que é?

Profissionais que trabalham em um salão podem também ser clientes do mesmo salão. O sistema permite alternar entre dois modos:

### 🧑‍💼 Modo Profissional
- Visualiza agendamentos dos clientes
- Gerencia horários e atendimentos
- Acessa faturamento pessoal
- Botão: **"Modo Cliente"**

### 🛍️ Modo Cliente
- Agenda serviços com outros profissionais
- Visualiza seus próprios agendamentos
- Gerencia perfil pessoal
- Botão: **"Modo Profissional"**

## Arquitetura Técnica

### Arquivos Principais

```
src/
├── lib/
│   └── auth-helpers.ts          # Funções de autenticação inteligente
├── app/
│   └── [tenantSlug]/
│       ├── login/page.tsx       # Login inteligente multi-tipo
│       ├── profile/page.tsx     # Área do cliente
│       └── profissional/
│           └── dashboard/page.tsx # Dashboard profissional
```

### Funções Principais

#### `intelligentLogin(identifier, password, tenantId)`
Função principal que autentica o usuário e determina seu tipo.

**Retorna:**
```typescript
{
  success: boolean
  userType: 'customer' | 'employee' | 'company_admin' | 'super_admin'
  userData: any
  redirectPath: string
  error?: string
}
```

#### `checkUserExists(identifier, tenantId)`
Verifica se um usuário existe sem validar senha (usado no passo de identificação).

**Retorna:**
```typescript
{
  exists: boolean
  userType?: UserType
  data?: any
}
```

#### `checkEmployeeAuth(email, password, tenantId)`
Autentica via Supabase Auth (profissionais/gerentes/admins).

#### `checkCustomerAuth(identifier, password, tenantId)`
Autentica via tabela `customer_credentials` (clientes).

## Fluxo de Login Passo a Passo

### Passo 1: Identificação
```
Usuário insere: CPF ou E-mail
                    ↓
          Chama checkUserExists()
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
Encontrado                    Não encontrado
    ↓                               ↓
Exibe nome + tipo            Vai para cadastro
```

### Passo 2: Confirmação
```
Usuário insere: Senha
                ↓
    Chama intelligentLogin()
                ↓
        Valida credenciais
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
Sucesso                  Erro
    ↓                       ↓
Redireciona          Exibe mensagem
```

## Segurança

### 🔒 Proteções Implementadas

1. **Senhas Criptografadas**
   - Clientes: Bcrypt (10 rounds)
   - Profissionais: Supabase Auth (bcrypt nativo)

2. **Validação de Tenant**
   - Profissionais só acessam o tenant correto
   - Clientes só veem dados do próprio tenant

3. **Service Role Key**
   - Usada apenas server-side
   - Nunca exposta no frontend

4. **Session Storage**
   - Armazena tipo de usuário
   - Validação em cada página protegida

### 🚨 Pontos de Atenção

⚠️ **IMPORTANTE**: Durante a transição do sistema mock para Supabase:
- Algumas rotas ainda usam mock auth (`auth-context.tsx`)
- Gradualmente migrar para Supabase Auth
- Manter compatibilidade durante transição

## Testando o Sistema

### Credenciais de Teste

#### Beleza Pura (`/beleza-pura/login`)

**Profissional:**
```
Email: julia@belezapura.com
Senha: senha
Redirect: /beleza-pura/profissional/dashboard
```

**Gerente:**
```
Email: gerente@belezapura.com
Senha: senha
Redirect: /dashboard
```

**Cliente:**
```
CPF: 123.456.789-01
Email: maria@email.com
Senha: senha123
Redirect: /beleza-pura/profile
```

### Testando Modo Dual

1. Faça login como `julia@belezapura.com`
2. Você verá o dashboard profissional
3. Clique em **"Modo Cliente"**
4. Será redirecionado para área de agendamento
5. Pode agendar serviço com outro profissional

## Próximos Passos

### ✅ Implementado
- [x] Sistema de detecção inteligente
- [x] Login multi-tipo em único endpoint
- [x] Badges coloridos por tipo de usuário
- [x] Redirecionamentos automáticos
- [x] Dashboard profissional básico
- [x] Botão para alternar modo

### 🚧 Em Desenvolvimento
- [ ] Implementar troca de modo cliente ↔ profissional
- [ ] Persistir modo escolhido (localStorage)
- [ ] Integração completa com dados reais do Supabase
- [ ] Migração completa de mock auth para Supabase
- [ ] Implementar RLS (Row Level Security)

### 🔮 Futuro
- [ ] Autenticação social (Google, Facebook)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Recuperação de senha
- [ ] Confirmação de email para novos usuários
- [ ] Logs de auditoria de login

## Troubleshooting

### Erro: "Usuário não encontrado"
- Verifique se o usuário existe no Supabase
- Confirme que o tenant_id está correto
- Execute o script de seed se necessário

### Erro: "Senha incorreta"
- Senhas de clientes: verificar bcrypt hash
- Senhas de profissionais: usar Supabase Auth
- Verificar se senha não tem espaços extras

### Redirect não funciona
- Verificar sessionStorage
- Confirmar que tenantSlug está correto
- Checar se página de destino existe

### Badge não aparece
- Verificar se userType está sendo retornado
- Confirmar que getUserTypeBadge() está sendo chamado
- Inspecionar detectedUser state

## Suporte

Para dúvidas ou problemas:
1. Verifique logs do console
2. Confira dados no Supabase
3. Revise documentação em `SUPABASE_SETUP.md`
4. Entre em contato com o time de desenvolvimento

---

**Última atualização:** 2025-12-29
**Versão:** 1.0.0
