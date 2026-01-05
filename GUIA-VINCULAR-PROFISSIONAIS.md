# 📋 Guia Completo: Vincular Profissionais aos Serviços

## 🎯 Objetivo

Vincular profissionais específicos a cada serviço para que apenas eles apareçam no agendamento online quando aquele serviço for selecionado.

---

## 📝 Passo a Passo

### 1️⃣ Popular Dados de Teste (Se necessário)

Se você ainda não tem profissionais cadastrados:

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo de `supabase-seed-professionals.sql`
5. **IMPORTANTE**: Verifique o `tenant_id` na linha que diz `'1'`
   - Para encontrar seu tenant_id correto, execute:
   ```sql
   SELECT id, name, slug FROM tenants;
   ```
   - Substitua todos os `'1'` pelo ID correto do seu tenant
6. Clique em **Run**

**Resultado:** 5 profissionais de exemplo serão criados!

---

### 2️⃣ Acessar Página de Serviços

1. Faça login como admin
2. Acesse: `/{tenantSlug}/servicos`
3. Você verá a lista de todos os serviços

---

### 3️⃣ Editar um Serviço

1. Clique no botão **"Configurar"** em qualquer serviço
2. Um modal será aberto com todas as configurações
3. Role até a seção **"Profissionais Vinculados"** (no final)

---

### 4️⃣ Vincular Profissionais

Na seção "Profissionais Vinculados" você verá checkboxes com os nomes:

```
☐ Maria Silva
☐ Ana Costa
☐ Juliana Santos
☐ Carlos Mendes
☐ Patrícia Lima
```

**Marque os profissionais** que podem realizar aquele serviço.

#### Exemplos de Vínculo:

**Serviço: Corte Feminino**
- ☑️ Maria Silva (Cabeleireira)
- ☐ Ana Costa
- ☐ Juliana Santos
- ☐ Carlos Mendes
- ☐ Patrícia Lima

**Serviço: Manicure**
- ☐ Maria Silva
- ☑️ Ana Costa (Manicure)
- ☐ Juliana Santos
- ☐ Carlos Mendes
- ☐ Patrícia Lima

**Serviço: Maquiagem**
- ☐ Maria Silva
- ☐ Ana Costa
- ☑️ Juliana Santos (Maquiadora)
- ☐ Carlos Mendes
- ☐ Patrícia Lima

**Serviço: Corte Masculino**
- ☐ Maria Silva
- ☐ Ana Costa
- ☐ Juliana Santos
- ☑️ Carlos Mendes (Barbeiro)
- ☐ Patrícia Lima

**Serviço: Limpeza de Pele**
- ☐ Maria Silva
- ☐ Ana Costa
- ☐ Juliana Santos
- ☐ Carlos Mendes
- ☑️ Patrícia Lima (Esteticista)

---

### 5️⃣ Salvar Alterações

Clique em **"Salvar Configurações"** no final do modal.

---

### 6️⃣ Testar no Agendamento

1. Abra uma aba anônima/privada do navegador
2. Acesse: `/{tenantSlug}/book`
3. Selecione um serviço (ex: "Corte Feminino")
4. Avance para a etapa de profissionais
5. **Apenas os profissionais vinculados aparecerão!** ✅

---

## 🔍 Como Funciona Tecnicamente

### Antes (Problema):
```
Cliente seleciona "Corte Feminino"
↓
Sistema mostra TODOS os profissionais
↓
Profissionais sem habilidade aparecem ❌
```

### Depois (Solução):
```
Cliente seleciona "Corte Feminino"
↓
Sistema busca service.specialties = [id da Maria]
↓
Filtra apenas: Maria Silva ✅
```

### Estrutura no Banco:

**Tabela: employees**
```sql
id | full_name    | specialties
---|--------------|-------------
1  | Maria Silva  | ['service-1', 'service-2']
2  | Ana Costa    | ['service-3']
```

**Tabela: services**
```sql
id | name          | tenant_id
---|---------------|----------
1  | Corte Feminino| 1
2  | Escova        | 1
3  | Manicure      | 1
```

**Quando Maria é vinculada ao "Corte Feminino":**
```
employees.specialties = ['service-1'] ← ID do serviço adicionado
```

**No agendamento:**
```typescript
// Filtrar profissionais
const filtered = employees.filter(emp =>
    emp.specialties.includes(selectedService.id)
)
// Resultado: Apenas Maria Silva
```

---

## 🎭 Casos de Uso

### Caso 1: Profissional Multifuncional
**Maria Silva**: Cabeleireira que faz corte E escova

Vincule ela a AMBOS serviços:
- ☑️ Corte Feminino
- ☑️ Escova

Resultado: Maria aparece em ambos!

### Caso 2: Especialista Único
**Ana Costa**: Só faz manicure

Vincule apenas:
- ☑️ Manicure

Resultado: Ana só aparece para manicure.

### Caso 3: Equipe Completa
**Limpeza de Pele**: Vários podem fazer

Vincule todos:
- ☑️ Maria Silva
- ☑️ Patrícia Lima
- ☑️ Juliana Santos

Resultado: Cliente pode escolher qualquer um dos 3.

---

## ❓ Perguntas Frequentes

### P: E se eu não vincular ninguém?
**R:** O sistema mostra TODOS os profissionais (fallback para não quebrar).

### P: Posso vincular depois?
**R:** Sim! Edite o serviço e marque/desmarque a qualquer momento.

### P: O vínculo afeta horários?
**R:** Sim! Apenas os horários dos profissionais vinculados serão considerados.

### P: Como desvincular?
**R:** Desmarque o checkbox e salve.

### P: Posso vincular um profissional a todos os serviços?
**R:** Sim! Marque ele em cada serviço que ele realiza.

---

## 🧪 Teste Completo

1. Cadastre 2 profissionais: **Ana** e **Maria**
2. Cadastre 2 serviços: **Corte** e **Manicure**
3. Vincule:
   - Ana → Manicure
   - Maria → Corte
4. Teste agendamento:
   - Selecione "Corte" → Deve aparecer **só Maria**
   - Selecione "Manicure" → Deve aparecer **só Ana**

✅ Se funcionou, está tudo certo!

---

## 📊 Resumo Visual

```
┌─────────────────┐
│  SERVIÇO        │
│  Corte Feminino │
└────────┬────────┘
         │
         │ Vincula
         ▼
┌─────────────────┐
│  PROFISSIONAIS  │
│  ☑️ Maria Silva  │
│  ☐ Ana Costa    │
│  ☐ Carlos       │
└────────┬────────┘
         │
         │ Aparece no agendamento
         ▼
┌─────────────────┐
│  CLIENTE VÊ     │
│  • Maria Silva  │
└─────────────────┘
```

---

**Criado:** 29/12/2025
**Versão:** 1.0
**Funcionalidade:** Totalmente implementada e testada ✅
