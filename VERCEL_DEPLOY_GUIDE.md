# 🚀 Guia de Deploy na Vercel

## Visão Geral

Este guia fornece instruções completas para fazer deploy do projeto **Health Army Volunteers** na **Vercel** com integração ao **Supabase**.

---

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

### 1. Conta no Supabase

Você precisa ter um projeto criado no Supabase com as tabelas já configuradas. Se ainda não fez isso, consulte o arquivo **SUPABASE_INTEGRATION_GUIDE.md** para instruções completas.

**Checklist Supabase:**
- [ ] Projeto criado no Supabase
- [ ] Connection string obtida
- [ ] Migrações executadas (`pnpm db:push`)
- [ ] Tabelas verificadas no dashboard

### 2. Conta na Vercel

Você precisa de uma conta na Vercel (gratuita ou paga).

### 3. Repositório Git

O projeto precisa estar em um repositório Git (GitHub, GitLab ou Bitbucket).

---

## 🚀 Deploy Passo a Passo

### Passo 1: Preparar o Projeto

Certifique-se de que todos os arquivos de configuração estão presentes:

```bash
cd /home/ubuntu/project

# Verificar arquivos essenciais
ls -la vercel.json              # ✅ Configuração da Vercel
ls -la api/trpc.js              # ✅ Função serverless tRPC
ls -la .vercelignore            # ✅ Arquivos a ignorar
ls -la .env.example             # ✅ Exemplo de variáveis
```

### Passo 2: Fazer Push para o Git

Commit e push de todas as alterações:

```bash
git add .
git commit -m "Configure Vercel deployment with Supabase Auth"
git push origin main
```

### Passo 3: Importar Projeto na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione seu repositório Git
4. Clique em **"Import"**

### Passo 4: Configurar o Projeto

Na tela de configuração:

**Framework Preset:**
- Selecione **"Other"** ou deixe em branco

**Root Directory:**
- Deixe como `.` (raiz do projeto)

**Build Command:**
```bash
pnpm build
```

**Output Directory:**
```
dist/public
```

**Install Command:**
```bash
pnpm install
```

### Passo 5: Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

**DATABASE_URL**
```
postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
> ⚠️ Use a **Connection Pooling** string do Supabase (Transaction Mode)

**VITE_SUPABASE_URL**
```
https://seu-projeto.supabase.co
```

**VITE_SUPABASE_ANON_KEY**
```
sua-anon-key-aqui
```

**SUPABASE_SERVICE_ROLE_KEY**
```
sua-service-role-key-aqui
```

**OWNER_NAME**
```
admin@healtharmy.com
```

**NODE_ENV**
```
production
```

### Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Vercel mostrará a URL do seu projeto

---

## 🔧 Configurações Importantes

### Connection Pooling do Supabase

Para melhor performance em serverless, use **Connection Pooling**:

1. No Supabase, vá em **Settings** → **Database**
2. Role até **Connection Pooling**
3. Copie a string do **Transaction Mode**
4. Use esta string na variável `DATABASE_URL`

**Formato:**
```
postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Diferenças:**
- Porta **6543** (não 5432)
- Host com `.pooler.supabase.com`
- Melhor para serverless (Vercel Functions)

---

## 🧪 Testar o Deploy

### 1. Verificar Build

No dashboard da Vercel, clique em **"Deployments"** e verifique:
- ✅ Build Status: Ready
- ✅ Sem erros no log
- ✅ Funções serverless criadas

### 2. Testar a Aplicação

Acesse a URL do projeto:

```
https://seu-projeto.vercel.app
```

**Testes essenciais:**
1. Página inicial carrega corretamente
2. Página de login (`/login`) funciona
3. Cadastro e Login via Supabase funcionam
4. Dashboard admin funciona (se for admin)
5. Cadastro de voluntários funciona

---

## 🛡️ Segurança

### Variáveis de Ambiente

**Nunca commite variáveis sensíveis no Git!**

✅ **Correto:**
- Configurar na Vercel Dashboard
- Usar `.env.local` para desenvolvimento (não commitado)

❌ **Errado:**
- Commitar arquivo `.env` com senhas
- Hardcoded de secrets no código

### HTTPS

A Vercel fornece HTTPS automaticamente:
- ✅ Certificado SSL gratuito
- ✅ Renovação automática
- ✅ HTTP/2 habilitado

---

## 🆘 Solução de Problemas

### Erro: "Database connection failed"

**Causa:** Não consegue conectar ao Supabase.

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Use a connection string com **pooling** (porta 6543)
3. Verifique se o Supabase está online

### Erro: "Auth session not found"

**Causa:** Variáveis do Supabase incorretas ou domínio não autorizado.

**Solução:**
1. Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
2. No Supabase, adicione o domínio da Vercel em **Authentication > URL Configuration > Site URL**

---

**Health Army Volunteers**
Documentação de Deploy atualizada para Supabase Auth.
