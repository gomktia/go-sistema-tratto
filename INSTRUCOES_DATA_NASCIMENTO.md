## Instruções para Adicionar Campo de Data de Nascimento no Cadastro de Clientes

### Arquivo: src/app/(app)/clientes/page.tsx

### Alteração 1: Atualizar o state formData (linha ~173)

**DE:**
```tsx
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: ""
})
```

**PARA:**
```tsx
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthdate: ""
})
```

### Alteração 2: Adicionar campo no formulário de NOVO cliente (após linha 438)

**Adicionar APÓS o campo de CPF:**
```tsx
<div className="space-y-2">
    <Label htmlFor="birthdate">Data de Nascimento</Label>
    <Input
        id="birthdate"
        type="date"
        value={formData.birthdate}
        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
    />
</div>
```

### Alteração 3: Atualizar função openEditDialog (linha ~338)

**DE:**
```tsx
const openEditDialog = (client: ClientRecord) => {
    setSelectedClient(client)
    setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf: client.cpf || ""
    })
    setShowEditClient(true)
}
```

**PARA:**
```tsx
const openEditDialog = (client: ClientRecord) => {
    setSelectedClient(client)
    setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf: client.cpf || "",
        birthdate: client.birthdate || ""
    })
    setShowEditClient(true)
}
```

### Alteração 4: Adicionar campo no formulário de EDIÇÃO (após linha 552)

**Adicionar APÓS o campo de CPF no formulário de edição:**
```tsx
<div className="space-y-2">
    <Label htmlFor="edit-birthdate">Data de Nascimento</Label>
    <Input
        id="edit-birthdate"
        type="date"
        value={formData.birthdate}
        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
    />
</div>
```

### Alteração 5: Atualizar resetForm (linha ~354)

**DE:**
```tsx
const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", cpf: "" })
    setSelectedClient(null)
}
```

**PARA:**
```tsx
const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", cpf: "", birthdate: "" })
    setSelectedClient(null)
}
```

---

## Benefícios desta Alteração:

✅ Permite cadastrar data de nascimento de novos clientes
✅ Permite editar data de nascimento de clientes existentes
✅ Sistema poderá identificar aniversariantes
✅ Empresas poderão criar campanhas de aniversário
✅ Possibilita envio automático de parabéns e descontos especiais

## Próximos Passos Sugeridos:

1. Criar uma funcionalidade de "Aniversariantes do Mês"
2. Adicionar notificações automáticas de aniversário
3. Criar campanhas de desconto para aniversariantes
4. Dashboard com lista de próximos aniversários
