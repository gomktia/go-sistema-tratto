# 🐛 Bug Fix: Race Condition na Importação de Dados

**Data:** 29/06/2026
**Status:** ✅ RESOLVIDO
**Severidade:** 🔴 CRÍTICO

---

## 📋 Sumário

Funcionalidade de importação de clientes completava com sucesso mas **0 registros eram salvos** no banco de dados. A interface mostrava "Importação concluída" mas nenhum cliente aparecia na lista.

---

## 🔍 Sintomas

1. ✅ Upload do arquivo funcionava
2. ✅ Parsing do CSV funcionava
3. ✅ Wizard avançava até o Step 4 (conclusão)
4. ❌ **0 Importados, 0 Atualizados**
5. ❌ Lista de clientes permanecia vazia

Console mostrava:
```javascript
🚀 executeImport: {type: 'clientes', totalRows: 0}
```

---

## 🎯 Causa Raiz

**Race Condition entre `setState` assíncrono e chamadas de função sequenciais.**

### Fluxo problemático:

```javascript
// ImportWizard.tsx
const handleFileSelect = async (file) => {
  await parseFile(file, type)        // 1. Chama parseFile
  await detectDuplicates()           // 2. Chama detectDuplicates
  setStep(3)                         // 3. Avança para preview
}

// useImport.ts - parseFile
const parseFile = async (file, type) => {
  const newSession = { file, type, rows: [] }
  setSession(newSession)             // ⚠️ setState é ASSÍNCRONO!
}

// useImport.ts - detectDuplicates
const detectDuplicates = async () => {
  if (!session) return               // ❌ session ainda é null!
  // Nunca executa...
}
```

### O problema:

1. `parseFile` cria session e chama `setSession(newSession)`
2. `setSession` é **assíncrono** - não atualiza o state imediatamente
3. `detectDuplicates` é chamado logo em seguida
4. `detectDuplicates` lê `session` do state → **ainda está `null`**!
5. `detectDuplicates` retorna sem processar nada
6. `executeImport` roda com `session.rows = []` → 0 importados

---

## ✅ Solução Implementada

**Passar dados diretamente como parâmetros ao invés de depender do state assíncrono.**

### Mudanças:

#### 1. ImportWizard.tsx - Passar file e type diretamente

```diff
const handleFileSelect = async (file) => {
  await parseFile(file, type)
- await detectDuplicates()
+ await detectDuplicates(file, type)  // ✅ Passa dados diretamente
  setTimeout(() => setStep(3), 500)
}
```

#### 2. useImport.ts - Aceitar parâmetros opcionais

```diff
- const detectDuplicates = async () => {
+ const detectDuplicates = async (
+   fileParam?: File,
+   typeParam?: ImportEntityType
+ ) => {
-   if (!session) return
+   const file = fileParam || session?.file
+   const type = typeParam || session?.type
+
+   if (!file || !type) return
```

#### 3. useImport.ts - Criar nova session ao invés de spread

```diff
- setSession({
-   ...session,  // ❌ session pode ser null!
-   rows,
-   summary: { ... }
- })

+ const newSession: ImportSession = {
+   file,
+   type,
+   rows,
+   summary: {
+     total: parsedData.rows.length,
+     novos,
+     duplicados,
+     erros
+   }
+ }
+ setSession(newSession)  // ✅ Nova session completa
```

---

## 🧪 Validação

### Antes (Broken):
```
🔍 detectDuplicates START, session: null
❌ No session, aborting
🚀 executeImport: totalRows: 0
```

### Depois (Fixed):
```
🔍 detectDuplicates START {file: 'clientes-teste.csv', type: 'clientes'}
📊 Parsed data: {rowCount: 4}
💾 Setting session with rows: {rowCount: 4, novos: 4}
✅ Session updated!
🚀 executeImport: totalRows: 4
```

---

## 📚 Lições Aprendidas

### 1. **Evitar dependência de state assíncrono em fluxos sequenciais**

❌ **Ruim:**
```javascript
await functionA()  // Chama setStateX()
await functionB()  // Depende de stateX - RACE CONDITION!
```

✅ **Bom:**
```javascript
const result = await functionA()
await functionB(result)  // Passa dados diretamente
```

### 2. **Sempre passar dados críticos como parâmetros**

Se uma função precisa de dados para funcionar, **receba como parâmetro** ao invés de buscar do state global.

### 3. **Adicionar logs de debug em fluxos complexos**

Logs ajudaram a identificar exatamente onde o state estava null:
```javascript
console.log('🔍 detectDuplicates START, session:', session)
```

### 4. **Testar com dados reais o quanto antes**

O bug só apareceu no teste real com CSV. Testes programáticos isolados não capturaram o race condition.

---

## 🔧 Como Evitar no Futuro

### Pattern: State como Cache, Parâmetros como Fonte

```javascript
// ✅ CORRETO
const processData = async (data: Data) => {
  const result = await transform(data)
  setState(result)  // State é cache para UI
  return result     // Retorna para próxima função
}

// ❌ ERRADO
const processData = async (data: Data) => {
  const result = await transform(data)
  setState(result)
  // Próxima função busca do state - race condition!
}
```

### Checklist de Code Review:

- [ ] Funções sequenciais dependem de state atualizado?
- [ ] setState é seguido de leitura imediata do mesmo state?
- [ ] Dados críticos são passados como parâmetros?
- [ ] Há timeout/delay "mágico" para "esperar state atualizar"?

---

## 📊 Impacto

| Métrica | Antes | Depois |
|---------|-------|--------|
| Taxa de sucesso de importação | 0% | 100% |
| Clientes importados por teste | 0 | 4/4 |
| Duplicatas detectadas | N/A | ✅ Funcional |
| Validação de dados | N/A | ✅ Funcional |

---

## 🔗 Arquivos Modificados

1. `src/components/import-export/ImportWizard.tsx`
   - Linha ~44: Passa `file` e `type` para `detectDuplicates()`

2. `src/hooks/useImport.ts`
   - Linha ~98: Aceita parâmetros opcionais
   - Linha ~240: Cria nova session ao invés de spread

3. `src/lib/import-export/transformers.ts`
   - Correção de mapeamento de campos (snake_case)

4. `src/lib/import-export/validators.ts`
   - Validação com campos corretos do banco

5. `src/lib/import-export/duplicate-detector.ts`
   - Comparação usando campos do schema Supabase

---

## ✅ Resolução Final

**Status:** Bug corrigido e sistema funcionando
**Teste:** 4/4 clientes importados com sucesso
**Commits:**
- Fix: Race condition in import flow - pass data as params
- Fix: Field mapping for Supabase schema (snake_case)

---

**Documentado por:** Claude Code Assistant
**Revisado por:** [Adicionar nome do revisor]
**Aprovado para produção:** [Data]
