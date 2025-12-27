# 🚀 Guia Rápido de Instalação

## Sistema de Autenticação e Painel Administrativo - Health Army Volunteers

Este guia fornece instruções passo a passo para colocar o sistema em funcionamento.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- Node.js 18+ instalado
- pnpm instalado
- Banco de dados MySQL configurado
- Variáveis de ambiente configuradas

---

## 📦 Passo 1: Instalar Dependências

Navegue até o diretório do projeto e instale as dependências:

```bash
cd /home/ubuntu/project
pnpm install
```

Isso instalará todas as dependências necessárias para o frontend e backend.

---

## 🗄️ Passo 2: Configurar Banco de Dados

### Verificar Variável de Ambiente

Certifique-se de que a variável `DATABASE_URL` está configurada no arquivo `.env`:

```env
DATABASE_URL=mysql://usuario:senha@host:porta/database
```

### Executar Migrações

Se ainda não executou as migrações do Drizzle:

```bash
pnpm db:push
```

Isso criará/atualizará as tabelas no banco de dados, incluindo a tabela `users` com o campo `role`.

---

## 👤 Passo 3: Configurar Usuário Administrador

Para ter acesso ao painel administrativo, você precisa definir pelo menos um usuário como admin.

### Opção A: Via Variável de Ambiente (Recomendado)

Configure o `ownerOpenId` no arquivo `.env`:

```env
OWNER_OPEN_ID=seu-open-id-aqui
```

O sistema automaticamente definirá este usuário como admin no primeiro login.

### Opção B: Via SQL Direto

Após fazer login pela primeira vez, execute este SQL no banco de dados:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

Substitua `seu-email@exemplo.com` pelo email da sua conta.

---

## 🔧 Passo 4: Verificar Arquivos Implementados

Certifique-se de que todos os arquivos foram criados corretamente:

### Novos Arquivos de Contexto:
- ✅ `client/src/contexts/AuthContext.tsx`

### Novos Componentes:
- ✅ `client/src/components/ProtectedRoute.tsx`

### Novas Páginas:
- ✅ `client/src/pages/Login.tsx`
- ✅ `client/src/pages/Unauthorized.tsx`
- ✅ `client/src/pages/AdminDashboard.tsx`
- ✅ `client/src/pages/AdminVolunteers.tsx`
- ✅ `client/src/pages/AdminVolunteerView.tsx`
- ✅ `client/src/pages/AdminVolunteerEdit.tsx`

### Arquivos Modificados:
- ✅ `client/src/App.tsx` (backup em `App.tsx.backup`)
- ✅ `client/src/components/Header.tsx`

---

## 🚀 Passo 5: Executar o Projeto

### Modo Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
pnpm dev
```

O sistema estará disponível em: `http://localhost:5000`

### Modo Produção

Para build de produção:

```bash
pnpm build
pnpm start
```

---

## 🧪 Passo 6: Testar o Sistema

### 1. Testar Página de Login

Acesse: `http://localhost:5000/login`

Você deve ver:
- Card para "Profissionais"
- Card para "Administração"
- Logo do Health Army

### 2. Testar Login como Profissional

1. Clique em "Entrar como Profissional"
2. Complete o processo de OAuth
3. Após login, você deve ser redirecionado para `/register`
4. Você deve ter acesso ao formulário de cadastro

### 3. Testar Login como Admin

1. Certifique-se de ter configurado um usuário admin (Passo 3)
2. Faça logout se estiver logado
3. Acesse `/login` novamente
4. Faça login com a conta admin
5. Você deve ser redirecionado para `/admin/dashboard`

### 4. Testar Painel Administrativo

Como admin, você deve ter acesso a:

- **Dashboard** (`/admin/dashboard`):
  - Estatísticas de voluntários
  - Cadastros recentes
  - Ações rápidas

- **Gerenciar Voluntários** (`/admin/volunteers`):
  - Lista completa de voluntários
  - Filtros por status e projeto
  - Busca por nome, email ou especialização
  - Ações: visualizar, editar, excluir

- **Visualizar Voluntário** (`/admin/volunteers/:id`):
  - Informações completas do voluntário
  - Disponibilidade de horários
  - Ações rápidas (email, telefone)

- **Editar Voluntário** (`/admin/volunteers/:id/edit`):
  - Formulário completo de edição
  - Alteração de status
  - Validação de campos

### 5. Testar Proteção de Rotas

1. Faça logout
2. Tente acessar diretamente `/admin/dashboard`
3. Você deve ser redirecionado para `/login`

4. Faça login como profissional (não admin)
5. Tente acessar `/admin/dashboard`
6. Você deve ser redirecionado para `/unauthorized`

---

## 🎯 Funcionalidades Principais

### Para Profissionais (role: user)
- ✅ Login via OAuth
- ✅ Acesso ao formulário de cadastro
- ✅ Visualização do próprio perfil
- ✅ Proteção de rotas

### Para Administradores (role: admin)
- ✅ Dashboard com estatísticas em tempo real
- ✅ CRUD completo de voluntários
- ✅ Filtros e busca avançada
- ✅ Visualização detalhada de cadastros
- ✅ Edição de status (ativo/pendente/inativo)
- ✅ Confirmação antes de excluir
- ✅ Ações rápidas (email, telefone)

---

## 🔍 Solução de Problemas Comuns

### Problema: "useAuth must be used within AuthProvider"

**Causa:** O AuthProvider não está envolvendo a aplicação.

**Solução:** Verifique se o `App.tsx` foi atualizado corretamente e o AuthProvider está presente.

### Problema: Usuário não é redirecionado após login

**Causa:** O AuthContext pode não estar carregando o usuário corretamente.

**Solução:**
1. Verifique se o tRPC está configurado corretamente
2. Abra o console do navegador e veja se há erros
3. Verifique se a rota `/api/auth/me` está retornando os dados do usuário

### Problema: Admin não consegue acessar painel

**Causa:** O role do usuário não está definido como 'admin' no banco de dados.

**Solução:**
1. Execute a query SQL para verificar: `SELECT * FROM users WHERE email = 'seu-email';`
2. Se o role não for 'admin', execute: `UPDATE users SET role = 'admin' WHERE email = 'seu-email';`
3. Faça logout e login novamente

### Problema: Erro ao compilar

**Causa:** Dependências faltando ou versões incompatíveis.

**Solução:**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Problema: Rotas não funcionam

**Causa:** O Wouter pode não estar configurado corretamente.

**Solução:** Verifique se todas as importações estão corretas e se não há erros de sintaxe no `App.tsx`.

---

## 📚 Documentação Adicional

Para informações mais detalhadas, consulte:

- **`AUTHENTICATION_GUIDE.md`** - Guia completo do sistema de autenticação
- **`CHANGELOG_AUTH.md`** - Lista de todas as mudanças implementadas

---

## 🎉 Pronto!

Se você seguiu todos os passos acima, seu sistema de autenticação e painel administrativo deve estar funcionando perfeitamente!

### Próximos Passos:

1. **Personalize o design** - Ajuste cores e estilos conforme sua marca
2. **Adicione mais funcionalidades** - Relatórios, exportação de dados, etc.
3. **Implemente testes** - Testes unitários e de integração
4. **Configure CI/CD** - Automatize o deploy
5. **Adicione monitoramento** - Logs e métricas

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:

1. Consulte a documentação completa em `AUTHENTICATION_GUIDE.md`
2. Verifique os comentários no código
3. Revise este guia novamente
4. Verifique o console do navegador e logs do servidor

---

**Desenvolvido para Health Army Volunteers**

Boa sorte! 🚀
