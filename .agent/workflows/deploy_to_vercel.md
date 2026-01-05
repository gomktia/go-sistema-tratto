---
description: Guia de Deploy para Produção (Vercel + Supabase)
---

# Guia de Deploy: BeautyFlow SaaS

Este guia cobre os passos para colocar seu sistema no ar usando a **Vercel** (hospedagem do Frontend) e **Supabase** (Banco de Dados).

## 1. Preparação (Git)
Certifique-se de que todo o seu código está salvo e enviado para o GitHub.
1. Crie um repositório no GitHub.
2. Envie o código:
   ```bash
   git add .
   git commit -m "Versão de Lançamento 1.0"
   git push origin main
   ```

## 2. Configuração na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório do Git que você acabou de enviar.
4. Na tela de configuração do projeto ("Configure Project"):
   *   **Framework Preset:** Next.js (deve ser detectado automaticamente).
   *   **Root Directory:** `./` (padrão).
   *   **Environment Variables:** Você precisa adicionar as variáveis do seu arquivo `.env.local`.
       *   Abra seu arquivo `.env.local` na sua máquina.
       *   Copie cada chave e valor para a Vercel.
       *   **Principais:**
           *   `NEXT_PUBLIC_SUPABASE_URL`
           *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
           *   `NEXT_PUBLIC_APP_URL` (Defina como a URL que a Vercel vai gerar, ex: `https://beautyflow-app.vercel.app`. Você pode atualizar isso depois do primeiro deploy).

5. Clique em **"Deploy"**.

## 3. Configuração Pós-Deploy (Supabase Auth)
**CRÍTICO:** Para o login funcionar em produção, você precisa autorizar o domínio da Vercel no Supabase.

1. Vá ao **Dashboard do Supabase** > **Authentication** > **URL Configuration**.
2. **Site URL:** Coloque a URL oficial do seu site (ex: `https://beautyflow-app.vercel.app`).
3. **Redirect URLs:** Adicione:
   *   `https://beautyflow-app.vercel.app/**`
   *   `https://beautyflow-app.vercel.app/auth/callback`
4. Salve.

## 4. Teste Final
1. Acesse a URL fornecida pela Vercel.
2. Tente fazer login com um usuário admin.
3. Teste o agendamento público (`/barbearia-viking`).

## 5. (Opcional) Domínio Personalizado
Se você tiver um domínio (ex: `meusalao.com.br`), vá nas configurações do projeto na Vercel > **Domains** e adicione-o lá. A Vercel cuidará do certificado SSL automaticamente.
