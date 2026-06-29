# Guia de Testes Manuais - Importação/Exportação

## Preparação

1. **Servidor rodando:** O servidor Next.js já está rodando em `localhost:3000`
2. **Login:** Acesse `/beleza-pura` e faça login
3. **Arquivos de teste:** Use os CSVs em `/test-data/`

---

## TESTE 1: Clientes

### 1.1 Cliente Novo ✓

**Passos:**
1. Ir para `/beleza-pura/clientes`
2. Clicar no botão **"Importar/Exportar"** (dropdown no header)
3. Selecionar **"Importar dados"**
4. Fazer upload de `test-data/clientes-teste.csv`
5. Aguardar processamento automático
6. Na prévia, verificar:
   - ✅ Linha 1 (Maria Silva Teste) → Status: **🆕 Novo** | Ação: **Importar**
7. Clicar em **"Confirmar e Importar"**
8. Verificar mensagem de sucesso: "1 importado"
9. Voltar para lista de clientes e confirmar que Maria aparece

**Resultado Esperado:** ✅ Cliente importado com sucesso

---

### 1.2 Cliente com CPF Igual ✓

**Passos:**
1. **SEM LIMPAR O BANCO** (Maria já existe do teste anterior)
2. Importar novamente `test-data/clientes-teste.csv`
3. Na prévia, verificar:
   - ✅ Linha 2 (Maria Silva Atualizada) → Status: **🔄 Duplicado (CPF)** | Ação: **Atualizar existente**
4. Confirmar importação
5. Verificar mensagem: "1 atualizado"
6. Voltar para lista e verificar que o nome mudou para "Maria Silva Atualizada"

**Resultado Esperado:** ✅ Cliente atualizado (não criou duplicata)

---

### 1.3 Cliente sem CPF mas Email Igual ✓

**Preparação:** Primeiro importar João com email diferente

**Criar CSV temporário** `clientes-joao-inicial.csv`:
```csv
Relatório de Clientes
...
---
CPF;Origem;Nome;...;E-mail;...
;Web;João Santos;...;joao.teste@email.com;...
```

**Passos:**
1. Importar `clientes-joao-inicial.csv` → João criado
2. Importar novamente `test-data/clientes-teste.csv`
3. Na prévia, verificar:
   - ✅ Linha 3 (João Santos Email Igual) → Status: **🔄 Duplicado (Email)** | Ação: **Atualizar**
4. Confirmar importação
5. Verificar: "1 atualizado"

**Resultado Esperado:** ✅ Detectou duplicata por email (sem CPF)

---

### 1.4 Cliente só com Telefone Igual (CRÍTICO) ⚠️

**Passos:**
1. Importar `test-data/clientes-teste.csv`
2. Na prévia, verificar:
   - ✅ Linha 4 (Ana Costa) tem telefone 11987654321 (igual à Maria)
   - ✅ Status: **⚠️ Possível duplicado**
   - ✅ Ação padrão: **Pular** (NÃO "Atualizar")
3. **TESTAR SEGURANÇA:** Mudar ação para "Atualizar" manualmente
4. Confirmar importação
5. Verificar que Ana NÃO sobrescreveu Maria (porque mudamos manualmente)
6. **REFAZER:** Importar de novo e deixar ação como "Pular"
7. Confirmar que Ana foi pulada (0 importados)

**Resultado Esperado:**
- ✅ Telefone igual NÃO atualiza automaticamente
- ✅ Proteção contra sobrescrita acidental

---

## TESTE 2: Serviços

### 2.1 Serviço Novo ✓

**Passos:**
1. Ir para `/beleza-pura/servicos`
2. Clicar **"Importar/Exportar" → "Importar dados"**
3. Upload `test-data/servicos-teste.csv`
4. Na prévia, verificar 5 serviços com status **🆕 Novo**
5. Confirmar importação
6. Verificar: "5 importados"

**Resultado Esperado:** ✅ 5 serviços importados

---

### 2.2 Validação de Preço ✓

**Passos:**
1. Na lista de serviços, verificar preços:
   - Corte Feminino: **R$ 200.00** (era "200,00" no CSV)
   - Manicure: **R$ 50.00**
   - Massagem: **R$ 150.00**
   - Design de Sobrancelhas: **R$ 35.00**

**Resultado Esperado:** ✅ Vírgula convertida para ponto

---

### 2.3 Validação de Duração ✓

**Passos:**
1. Clicar em "Editar" em cada serviço e verificar durações:
   - Corte Feminino: **90 minutos** (era "1h e 30 min")
   - Manicure: **45 minutos** (era "45 min")
   - Pedicure: **60 minutos** (era "1h")
   - Massagem: **120 minutos** (era "2h")
   - Design: **30 minutos** (era "30 min")

**Resultado Esperado:** ✅ Todas durações convertidas corretamente

---

### 2.4 Exportar CSV e XLSX ✓

**Passos:**
1. Clicar **"Importar/Exportar" → "Exportar CSV"**
2. Verificar download de `servicos_2026-06-29.csv`
3. Abrir arquivo e confirmar formato Trinks (delimiter `;`)
4. Clicar **"Importar/Exportar" → "Exportar XLSX"**
5. Verificar download de `servicos_2026-06-29.xlsx`
6. Abrir no Excel/Google Sheets

**Resultado Esperado:**
- ✅ CSV baixado com formato correto
- ✅ XLSX abre corretamente

---

## TESTE 3: Profissionais

### 3.1 Profissional Novo ✓

**Passos:**
1. Ir para `/beleza-pura/funcionarios`
2. Clicar **"Importar/Exportar" → "Importar dados"**
3. Upload `test-data/profissionais-teste.csv`
4. Na prévia, verificar 3 profissionais com status **🆕 Novo**
5. Confirmar importação
6. Verificar: "3 importados"

**Resultado Esperado:** ✅ 3 profissionais importados

---

### 3.2 Validação de Campos Obrigatórios ⚠️

**Passos:**
1. Upload `test-data/profissionais-erro.csv`
2. Na prévia, verificar:
   - ✅ Linha 1: Status **❌ Erro** | Mensagem: "Nome completo é obrigatório"
   - ✅ Linha 2: Status **❌ Erro** | Mensagem: "Email válido é obrigatório"
   - ✅ Linha 3: Status **❌ Erro** | Mensagem: "Telefone é obrigatório"
3. Verificar que ação está **bloqueada em "Pular"** (select disabled)
4. Botão "Confirmar" deve estar disponível mas resultar em 0 importações
5. Confirmar e verificar: "3 pulados"

**Resultado Esperado:**
- ✅ Erros detectados corretamente
- ✅ Linhas com erro não podem ser importadas

---

### 3.3 Exportar CSV e XLSX ✓

**Passos:**
1. Clicar **"Importar/Exportar" → "Exportar CSV"**
2. Verificar download
3. Clicar **"Importar/Exportar" → "Exportar XLSX"**
4. Verificar download

**Resultado Esperado:** ✅ Ambos formatos funcionam

---

## TESTE 4: UI

### 4.1 Botões Aparecem ✓

**Passos:**
1. Ir para `/beleza-pura/clientes` → Verificar botão "Importar/Exportar" no header
2. Ir para `/beleza-pura/servicos` → Verificar botão "Importar/Exportar" no header
3. Ir para `/beleza-pura/funcionarios` → Verificar botão "Importar/Exportar" no header

**Resultado Esperado:** ✅ Botão presente em todas as 3 páginas

---

### 4.2 Wizard Avança 4 Etapas ✓

**Passos:**
1. Abrir wizard de importação
2. **Step 1:** Upload → Verificar UI de drag-and-drop
3. **Step 2:** Aguardar processamento automático (spinner)
4. **Step 3:** Verificar tabela de prévia com badges de status
5. **Step 4:** Verificar tela de conclusão com ícone verde ✓

**Resultado Esperado:**
- ✅ 4 etapas funcionam
- ✅ Transições suaves

---

### 4.3 Preview Permite Trocar Ação ✓

**Passos:**
1. Na prévia, selecionar linha com status "Duplicado"
2. Clicar no dropdown de ação
3. Verificar opções disponíveis:
   - Atualizar existente
   - Pular
   - Importar como novo
4. Mudar de "Atualizar" para "Pular"
5. Confirmar importação
6. Verificar que a mudança foi respeitada

**Resultado Esperado:** ✅ Ações podem ser alteradas manualmente

---

### 4.4 Erro Bloqueia Submit ✓

**Passos:**
1. Importar arquivo com erros (`profissionais-erro.csv`)
2. Na prévia, tentar mudar ação de linha com erro
3. Verificar que select está **disabled** (cinza)
4. Confirmar importação mesmo assim
5. Verificar que linhas com erro foram puladas

**Resultado Esperado:**
- ✅ Select bloqueado em linhas com erro
- ✅ Não é possível importar com erro

---

## TESTE 5: Segurança

### 5.1 Nada Salva Antes da Confirmação ✓

**Passos:**
1. Abrir wizard de importação
2. Fazer upload de arquivo
3. **APÓS STEP 2 (preview):** Clicar em "Cancelar"
4. Ir para lista e verificar que NADA foi importado
5. Repetir, mas desta vez avançar até step 3 e cancelar antes de confirmar
6. Verificar novamente que nada foi salvo

**Resultado Esperado:**
- ✅ Cancelar em qualquer momento antes da confirmação = zero registros salvos
- ✅ Apenas "Confirmar e Importar" salva dados

---

### 5.2 Telefone NÃO Sobrescreve ✓

**Já testado em 1.4**

**Reforçar:**
- ✅ Ação padrão para telefone igual é "Pular"
- ✅ Usuário pode mudar manualmente, mas sistema não faz isso automaticamente
- ✅ Proteção contra perda de dados

---

## Resumo de Verificação

Marcar cada item conforme testar:

**Clientes:**
- [ ] 1.1 Cliente novo
- [ ] 1.2 CPF igual atualiza
- [ ] 1.3 Email igual atualiza (sem CPF)
- [ ] 1.4 Telefone igual NÃO atualiza

**Serviços:**
- [ ] 2.1 Serviço novo
- [ ] 2.2 Preço 200,00 → 200.0
- [ ] 2.3 Duração 1h30 → 90min
- [ ] 2.4 Export CSV/XLSX

**Profissionais:**
- [ ] 3.1 Profissional novo
- [ ] 3.2 Campos obrigatórios bloqueiam
- [ ] 3.3 Export CSV/XLSX

**UI:**
- [ ] 4.1 Botões em 3 páginas
- [ ] 4.2 Wizard 4 etapas
- [ ] 4.3 Preview editável
- [ ] 4.4 Erro bloqueia

**Segurança:**
- [ ] 5.1 Cancelar não salva
- [ ] 5.2 Telefone não sobrescreve

---

## Se Encontrar Problema

1. Anotar exatamente qual passo falhou
2. Capturar erro no console do browser (F12)
3. Reportar o que esperava vs o que aconteceu
4. Eu corrijo e retestamos

---

## Após Passar em Todos

✅ Fazer commit:
```bash
git add .
git commit -m "feat: adiciona importacao e exportacao de dados Trinks

- Importacao CSV/XLSX com suporte ao formato Trinks (ISO-8859-1)
- Deteccao hierarquica de duplicatas (CPF > Email > Telefone)
- Wizard de 4 etapas com preview editavel
- Validacao de campos obrigatorios e conversao de formatos
- Exportacao para CSV e XLSX compativel com Trinks
- Botoes de import/export em Clientes, Servicos e Profissionais
- Seguranca: nada salva antes da confirmacao final
- Protecao: telefone igual nao sobrescreve automaticamente

Co-Authored-By: Claude (claude-sonnet-4-5) <noreply@anthropic.com>"
```

Boa sorte nos testes! 🚀
