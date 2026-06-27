# 🔐 Credenciais de Ana Cláudia Strapasson

## 📋 Dados Cadastrais:
- **Nome Completo:** Ana Cláudia Strapasson
- **CPF:** 025.145.040-66
- **Email:** anaclaudiastrapasson@hotmail.com
- **Celular:** (55) 96253-807
- **Data de Nascimento:** 19/01/1991

## 🔑 Credenciais de Login:

### Para Agendamento Online:
- **CPF:** 02514504066 (sem pontos e traço)
- **Senha:** ana123456

### Empresas onde está cadastrada:
1. ✅ Beleza Pura (beleza-pura)
2. ✅ Studio Glamour (studio-glamour)
3. ✅ Espaço Elegance (espaco-elegance)

## 🌐 Como Testar o Portal:

### 1. Acessar Portal de Agendamento:
```
http://localhost:3000/beleza-pura/book
http://localhost:3000/studio-glamour/book
http://localhost:3000/espaco-elegance/book
```

### 2. Fluxo de Agendamento:
1. Escolher um serviço
2. Escolher um profissional
3. Escolher data e horário
4. **Na tela de identificação:**
   - Digitar CPF: `02514504066`
   - Sistema vai reconhecer que é cliente existente
   - Pedir senha: `ana123456`
   - Clicar em "Entrar"

### 3. Portal do Cliente (Profile):
```
http://localhost:3000/beleza-pura/profile
http://localhost:3000/studio-glamour/profile
http://localhost:3000/espaco-elegance/profile
```

## 🔍 Como o Sistema Identifica:

O sistema de agendamento identifica Ana Cláudia por:
- ✅ **CPF** (025.145.040-66)
- ✅ **Email** (anaclaudiastrapasson@hotmail.com)

Quando ela digita o CPF no formulário de agendamento:
1. Sistema busca no banco se o CPF já existe
2. Se existir, muda para modo "Login" (pede senha)
3. Se não existir, fica em modo "Cadastro" (pede todos os dados)

## 📝 Próximos Passos:

### Execute este SQL no Supabase:
```sql
-- Ver arquivo: supabase/create_ana_claudia_credentials.sql
```

Isso vai criar as credenciais de login para Ana Cláudia poder:
- Fazer agendamentos online
- Acessar seu perfil
- Ver histórico de serviços
- Gerenciar seus dados

## ⚠️ Importante:

A senha `ana123456` é apenas para testes. Em produção, a cliente deve:
1. Criar sua própria senha no primeiro acesso
2. Ou usar a funcionalidade "Esqueci minha senha"
