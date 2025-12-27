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

**Criar conta:**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Conecte com GitHub, GitLab ou Bitbucket
4. Confirme seu email

### 3. Repositório Git

O projeto precisa estar em um repositório Git (GitHub, GitLab ou Bitbucket).

**Se ainda não tem:**
```bash
cd /home/ubuntu/project
git init
git add .
git commit -m "Initial commit - Health Army Volunteers"
git remote add origin https://github.com/seu-usuario/health-army-volunteers.git
git push -u origin main
```

### 4. Configuração OAuth

Você precisa ter configurado o Manus OAuth com um App ID válido.

---

## 🚀 Deploy Passo a Passo

### Passo 1: Preparar o Projeto

Certifique-se de que todos os arquivos de configuração estão presentes:

```bash
cd /home/ubuntu/project

# Verificar arquivos essenciais
ls -la vercel.json              # ✅ Configuração da Vercel
ls -la api/trpc.js              # ✅ Função serverless tRPC
ls -la api/oauth.js             # ✅ Função serverless OAuth
ls -la .vercelignore            # ✅ Arquivos a ignorar
ls -la .env.production.example  # ✅ Exemplo de variáveis
```

### Passo 2: Fazer Push para o Git

Commit e push de todas as alterações:

```bash
git add .
git commit -m "Configure Vercel deployment"
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

**VITE_OAUTH_PORTAL_URL**
```
https://oauth.manus.im
```

**OAUTH_SERVER_URL**
```
https://oauth.manus.im
```

**VITE_APP_ID**
```
seu-app-id-aqui
```

**OWNER_OPEN_ID**
```
seu-open-id-aqui
```

**OWNER_NAME**
```
admin@healtharmy.com
```

**NODE_ENV**
```
production
```

#### Variáveis Opcionais:

**VITE_SUPABASE_URL** (se usar Supabase client)
```
https://seu-projeto.supabase.co
```

**VITE_SUPABASE_ANON_KEY** (se usar Supabase client)
```
sua-anon-key-aqui
```

### Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Vercel mostrará a URL do seu projeto

**URL de produção:**
```
https://seu-projeto.vercel.app
```

### Passo 7: Configurar Domínio Personalizado (Opcional)

1. No dashboard do projeto, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `healtharmy.com`)
4. Siga as instruções para configurar DNS

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

### Configurar OAuth Callback

Atualize o callback URL no Manus OAuth:

**URL de callback:**
```
https://seu-projeto.vercel.app/api/oauth/callback
```

**Como configurar:**
1. Acesse o painel do Manus OAuth
2. Edite seu App
3. Adicione a URL de callback da Vercel
4. Salve as alterações

### Configurar CORS (se necessário)

Se tiver problemas com CORS, adicione estas variáveis:

**ALLOWED_ORIGINS**
```
https://seu-projeto.vercel.app,https://seu-dominio.com
```

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
3. OAuth redireciona corretamente
4. Após login, usuário é redirecionado
5. Dashboard admin funciona (se for admin)
6. Cadastro de voluntários funciona

### 3. Verificar Logs

Se houver erros, verifique os logs:

1. No dashboard, clique em **"Functions"**
2. Selecione a função com erro
3. Veja os logs em tempo real
4. Identifique o problema

**Logs comuns:**
- Erro de conexão com banco → Verificar `DATABASE_URL`
- Erro de OAuth → Verificar callback URL
- Erro 500 → Verificar variáveis de ambiente

---

## 🔄 Atualizações e Redeploy

### Deploy Automático

A Vercel faz deploy automático a cada push no Git:

```bash
# Fazer alterações no código
git add .
git commit -m "Update feature X"
git push origin main

# Vercel detecta e faz deploy automaticamente
```

### Deploy Manual

Para forçar um redeploy:

1. No dashboard, vá em **"Deployments"**
2. Clique nos três pontos do último deploy
3. Selecione **"Redeploy"**

### Rollback

Para voltar a uma versão anterior:

1. No dashboard, vá em **"Deployments"**
2. Encontre o deploy anterior que funcionava
3. Clique nos três pontos
4. Selecione **"Promote to Production"**

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

### Headers de Segurança

O arquivo `vercel.json` já inclui headers de segurança:
- CORS configurado
- Credentials permitidos para OAuth

---

## 📊 Monitoramento

### Analytics

A Vercel oferece analytics gratuito:

1. No dashboard, vá em **"Analytics"**
2. Veja métricas de:
   - Visitantes únicos
   - Page views
   - Top pages
   - Dispositivos

### Logs em Tempo Real

Para ver logs em tempo real:

1. No dashboard, vá em **"Functions"**
2. Selecione a função (trpc ou oauth)
3. Veja logs ao vivo
4. Filtre por erro, warning, info

### Alertas

Configure alertas para erros:

1. No dashboard, vá em **"Settings"** → **"Notifications"**
2. Configure notificações por:
   - Email
   - Slack
   - Discord
   - Webhook

---

## 🆘 Solução de Problemas

### Erro: "Build failed"

**Causa:** Erro durante o build do projeto.

**Solução:**
1. Verifique os logs do build na Vercel
2. Teste o build localmente: `pnpm build`
3. Corrija os erros e faça push novamente

### Erro: "Function invocation failed"

**Causa:** Erro na execução da função serverless.

**Solução:**
1. Verifique os logs da função
2. Verifique variáveis de ambiente
3. Teste localmente com `pnpm dev`

### Erro: "Database connection failed"

**Causa:** Não consegue conectar ao Supabase.

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Use a connection string com **pooling** (porta 6543)
3. Verifique se o Supabase está online
4. Teste a conexão localmente

### Erro: "OAuth callback failed"

**Causa:** Callback URL não configurado corretamente.

**Solução:**
1. Verifique se a URL de callback está correta no Manus OAuth
2. Formato: `https://seu-projeto.vercel.app/api/oauth/callback`
3. Certifique-se de que `VITE_APP_ID` está correto

### Erro: "Module not found"

**Causa:** Dependência faltando ou path incorreto.

**Solução:**
1. Verifique se todas as dependências estão no `package.json`
2. Execute `pnpm install` localmente
3. Verifique imports no código
4. Faça push e redeploy

### Site carrega mas API não funciona

**Causa:** Funções serverless não configuradas corretamente.

**Solução:**
1. Verifique se os arquivos `api/trpc.js` e `api/oauth.js` existem
2. Verifique o `vercel.json`
3. Teste as rotas: `/api/trpc` e `/api/oauth/callback`

---

## 📈 Otimizações

### Performance

**Edge Functions** (opcional):
- Mova funções para edge para menor latência
- Configure em `vercel.json`:
```json
{
  "functions": {
    "api/trpc.js": {
      "runtime": "edge"
    }
  }
}
```

**Caching:**
- Configure cache headers para assets estáticos
- Use ISR (Incremental Static Regeneration) se aplicável

### Custos

**Plano Gratuito:**
- 100GB bandwidth/mês
- 100 horas de execução/mês
- Serverless functions ilimitadas
- Suficiente para projetos pequenos/médios

**Plano Pro ($20/mês):**
- 1TB bandwidth/mês
- 1000 horas de execução/mês
- Analytics avançado
- Suporte prioritário

---

## 🔗 Recursos Adicionais

### Documentação Oficial

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### Tutoriais

- [Deploy Node.js App](https://vercel.com/docs/frameworks/node)
- [Deploy with Supabase](https://vercel.com/guides/deploying-nextjs-using-supabase)
- [Custom Domains](https://vercel.com/docs/custom-domains)

### Ferramentas

- [Vercel CLI](https://vercel.com/download) - Deploy via terminal
- [Vercel Desktop](https://vercel.com/download) - App desktop
- [GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

---

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

### Pré-Deploy
- [ ] Projeto no Supabase criado
- [ ] Migrações executadas
- [ ] Repositório Git configurado
- [ ] Código commitado e pushed
- [ ] OAuth configurado

### Durante Deploy
- [ ] Projeto importado na Vercel
- [ ] Build command configurado
- [ ] Output directory configurado
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Connection pooling string usada

### Pós-Deploy
- [ ] Build completado sem erros
- [ ] Site acessível na URL da Vercel
- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] OAuth callback funciona
- [ ] Dashboard admin acessível
- [ ] Cadastro de voluntários funciona
- [ ] Dados salvos no Supabase

---

## 🎉 Conclusão

Seu projeto agora está configurado para deploy na Vercel! Siga os passos acima para fazer o deploy e ter sua aplicação rodando em produção.

**Próximos passos:**
1. Faça o deploy seguindo este guia
2. Configure um domínio personalizado
3. Configure alertas de erro
4. Monitore analytics
5. Otimize performance conforme necessário

---

**Desenvolvido para Health Army Volunteers**

**Data:** Dezembro 2024

**Stack:** React + TypeScript + Vite + tRPC + Supabase + Vercel
