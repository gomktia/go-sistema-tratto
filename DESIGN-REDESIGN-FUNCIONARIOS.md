# Redesign: Página de Funcionários (Tratto)
> Especificação para implementação no Google Stitch
> Data: 28 jun 2026 | Status: **RASCUNHO PARA VALIDAÇÃO NO STITCH**

---

## 1. Mudanças Estruturais Principais

### Antes (atual)
- Grid 3 colunas com muita informação por card
- Cards mostram: avatar + nome + especialidades + email + comissão + status booking
- List view como alternativa complexa
- Toggle grid/list view

### Depois (proposto)
- **Lista única simplificada** (sem toggle view)
- Cards em 2 variantes:
  - **Desktop (≥1024px):** Linhas em tabela visual (não HTML table, apenas layout card)
  - **Mobile (<768px):** Stack vertical, 1 card por profissional
- Informação inline reduzida: **Nome + Especialidades + Botões de ação**
- Detalhes (email, telefone, comissão) → **Drawer ao clitar em profissional**

---

## 2. Layout da Página (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                     HEADER (64px)                               │
│  Equipe                                  [+ Novo Profissional]  │
│  Gestão de profissionais e talentos.                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔍 Buscar por nome ou especialidade...    Time: 12 profissionais│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ M │ Maria Silva          Cabelo, Esmaltação  [✎ ≡ 🗑]       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ A │ Ana Costa           Sobrancelha, Maquiagem [✎ ≡ 🗑]      │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ C │ Carolina Mendes    Cabelo                  [✎ ≡ 🗑]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Tokens aplicados:**
- Background: `--paper` (#F4EDE1)
- Header text: Fraunces 28px italic (palavra "Equipe"), subtitle Inter Tight 14px
- Search: Inter Tight 14px, bg-subtle, border-default
- Cards: bg-surface (#FFFFFF), border-default, radius-lg

---

## 3. Card de Profissional (Desktop)

### Estrutura
```
┌──────────────────────────────────────────────────┐
│  M  │ Maria Silva                   [✎] [≡] [🗑] │
│     │ Cabelo, Esmaltação                        │
└──────────────────────────────────────────────────┘
```

**Altura:** 56px (compacta)
**Padding:** 12px left/right, 8px top/bottom
**Gap interno:** 12px entre avatar e texto

### Avatar
- **Size:** 40px × 40px
- **Cor:** `--copper` (#B98547)
- **Texto:** Primeira letra do nome, Inter Tight 18px/600, branco
- **Radius:** full (9999px)

### Texto
```
Maria Silva                          Inter Tight 14px/600/--ink
Cabelo, Esmaltação                   Inter Tight 12px/400/--text-secondary
```

**Especialidades como badges inline?** NÃO — texto simples, virgula-separado.

### Ações (hover reveal)
**Sempre visíveis no desktop**, à direita:
- `[✎]` Editar — Button ghost 32px, ícone ti-pencil 16px
- `[≡]` Ver agenda — Button ghost 32px, ícone ti-calendar 16px
- `[🗑]` Deletar — Button ghost 32px, ícone ti-trash 16px, hover vermelho

**Estados:**
- Hover card: `border-color: --border-strong`, transição 120ms ease
- Ícones padrão: text-secondary 16px
- Hover ícone: copper (editur), cobre (agenda), danger (deletar)

---

## 4. Seleção (Traço Cobre)

Quando profissional é clicado (selecionado para editar):
- `border-left: 2px solid --copper` (#B98547)
- `background: rgba(185, 133, 71, 0.06)` (copper 6% opacity)

---

## 5. Card de Profissional (Mobile)

```
┌─────────────────────────┐
│  M │ Maria Silva        │
│    │ Cabelo, Esmaltação │
│                         │
│    [✎ Editar]          │
│    [≡ Agenda]           │
│    [🗑 Deletar]         │
└─────────────────────────┘
```

**Layout vertical stack:**
- Avatar + nome/especialidades em row horizontal
- Botões em coluna abaixo, full-width (lg size, 44px)
- Padding: 16px
- Border-radius: radius-lg (12px)

---

## 6. Drawer de Detalhes

Ao clicar na **linha do profissional** (não no ícone de editar), abre drawer com:

```
┌─────────────────────────────────┐
│ Maria Silva             [×]     │
├─────────────────────────────────┤
│                                 │
│ Email                           │
│ maria@example.com               │
│                                 │
│ Telefone                        │
│ (11) 9 8765-4321                │
│                                 │
│ Comissão                        │
│ 40%                             │
│                                 │
│ Agendamentos online             │
│ [●] Ativo                       │
│                                 │
│ Horário de trabalho             │
│ Segunda   09:00 — 18:00         │
│ Terça     09:00 — 18:00         │
│ ...                             │
│                                 │
├─────────────────────────────────┤
│ [Cancelar]  [Editar]            │
└─────────────────────────────────┘
```

**Comportamento:**
- Header: título Inter Tight 15px/600, botão X ghost ti-x 20px
- Campos: label Inter Tight 13px/500/text-secondary, valor Inter Tight 14px/400/ink
- Telefone/valores numéricos: JetBrains Mono 13px
- Horários: 7 dias, cada um Inter Tight + JetBrains Mono para horários
- Toggle: Switch padrão + label
- Footer: botões [Cancelar] secondary + [Editar] primary copper

---

## 7. Search + Stats Bar

Mantém a atual mas simplifica:

```
┌────────────────────────────────────────────────┐
│ 🔍 Buscar por nome ou especialidade...  12     │
└────────────────────────────────────────────────┘
```

- Search input: bg-subtle, border-default, radius-xl (24px), altura 44px
- Stats: Inter Tight 12px/500/text-muted (eyebrow) + 20px/600/ink (número)
- Label stats: "PROFISSIONAIS" em JetBrains Mono 10px uppercase

---

## 8. Estados Especiais

### Empty State (sem profissionais)
```
┌─────────────────────────────────┐
│                                 │
│         [ti-scissors 40px]      │
│                                 │
│  Nenhum profissional cadastrado │
│  Clique em "Novo Profissional"  │
│                                 │
│    [+ Novo Profissional]        │
│                                 │
└─────────────────────────────────┘
```

### Loading
- **Skeleton cards:** 5 linhas de skeleton (altura 56px cada), bg-subtle com pulse opacity
- Duração: 1.2s, ease-in-out

### Confirmação de Delete
```
┌─────────────────────────────────┐
│ Remover Maria Silva?            │
├─────────────────────────────────┤
│ Esta ação não pode ser desfeita. │
│                                 │
│ [Manter]  [Remover]             │
└─────────────────────────────────┘
```

- Button [Manter]: secondary
- Button [Remover]: danger (#8F3535)

---

## 9. Removido do Design

❌ **Grid/List view toggle** — Vista única simplificada
❌ **Email/Telefone inline** → Drawer
❌ **Comissão inline** → Drawer
❌ **Status booking badge** → Drawer (toggle)
❌ **Dark mode complexity** — Manter design claro em light mode
❌ **Animações de zoom/bounce** — Usar ease smooth apenas

---

## 10. Tokens CSS a Aplicar no Stitch

```css
/* Brand Colors */
--paper: #F4EDE1
--ink: #1C1613
--copper: #B98547
--copper-soft: #D9B684

/* Backgrounds */
--bg-surface: #FFFFFF
--bg-subtle: #EDE7D9

/* Text */
--text-secondary: #6B5D4F
--text-muted: #A8998A

/* Borders */
--border-default: #E8E2D5
--border-strong: #CEC4B5

/* Status */
--status-danger: #8F3535
--status-danger-bg: #F5E8E8

/* Tipografia */
--font-display: Fraunces
--font-body: Inter Tight
--font-mono: JetBrains Mono
```

---

## 11. Checklist para Stitch

- [ ] Removido toggle grid/list
- [ ] Card de profissional: avatar 40px full + nome + especialidades (texto simples)
- [ ] Ações inline à direita (sempre visíveis desktop)
- [ ] Traço cobre 2px left em seleção
- [ ] Search bar simplificado, stats à direita
- [ ] Drawer de detalhes com email/telefone/comissão/horários
- [ ] Mobile stack vertical, botões full-width
- [ ] Empty state com copy correto
- [ ] Skeleton loading
- [ ] Modal delete (não inline)
- [ ] Sem emojis (usar ícones Tabler outline)
- [ ] Todos os backgrounds seguem tokens (--paper, --bg-surface, --bg-subtle)
- [ ] Fraunces apenas em título de página
- [ ] Inter Tight em toda UI operacional
- [ ] JetBrains Mono em dados numéricos/mono

---

## 12. Próximas Fases (não fazer agora)

1. **Serviços** — Mesmo padrão simplificado
2. **Agenda** — Calendar view + cards de agendamento
3. **Financeiro** — Tabela de comissões + gráfico de receita

---

*Especificação criada: 2026-06-28 20:29 GMT-3*
*Referência: DESIGN.md Tratto v2.0*
