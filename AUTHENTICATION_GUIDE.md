# Guia de Autenticação e Sistema Administrativo

## 📋 Visão Geral

Este documento descreve o sistema de autenticação e gerenciamento implementado no projeto Health Army Volunteers. O sistema possui dois tipos de usuários com permissões distintas:

- **Profissionais (role: user)**: Acesso ao formulário de cadastro de voluntários
- **Administração (role: admin)**: Acesso completo ao painel administrativo com CRUD

## 🏗️ Arquitetura Implementada

### 1. Contexto de Autenticação (`AuthContext.tsx`)

Localização: `client/src/contexts/AuthContext.tsx`

**Funcionalidades:**
- Gerenciamento de estado de autenticação
- Verificação de role do usuário (admin/user)
- Função de logout
- Hook `useAuth()` para acesso em qualquer componente

**Uso:**
```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isAdmin, isProfessional, logout } = useAuth();
  
  if (isAdmin) {
    // Lógica para admin
  }
}
```

### 2. Componente de Proteção de Rotas (`ProtectedRoute.tsx`)

Localização: `client/src/components/ProtectedRoute.tsx`

**Funcionalidades:**
- Protege rotas que requerem autenticação
- Protege rotas que requerem permissão de admin
- Redireciona usuários não autorizados

**Props:**
- `requireAuth`: Requer que o usuário esteja autenticado
- `requireAdmin`: Requer que o usuário seja admin

**Uso:**
```typescript
<Route path="/admin/dashboard">
  <ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>
</Route>
```

## 📄 Páginas Implementadas

### Páginas Públicas

#### 1. Login (`/login`)
- Página inicial de autenticação
- Dois cards: um para profissionais, outro para administração
- Redirecionamento automático baseado em role após login
- Localização: `client/src/pages/Login.tsx`

#### 2. Unauthorized (`/unauthorized`)
- Exibida quando usuário tenta acessar área sem permissão
- Botões para voltar à página inicial ou fazer logout
- Localização: `client/src/pages/Unauthorized.tsx`

### Páginas de Profissionais (Requer Autenticação)

#### 1. Formulário de Cadastro (`/register`)
- Acessível apenas para usuários autenticados
- Permite cadastro de novos voluntários
- Localização: `client/src/pages/VolunteerForm.tsx`

#### 2. Meu Perfil (`/my-profile`)
- Visualização e edição do perfil do profissional
- Localização: `client/src/pages/MyProfile.tsx`

### Páginas Administrativas (Requer Role Admin)

#### 1. Dashboard Administrativo (`/admin/dashboard`)
- Visão geral com estatísticas
- Cards com totais de voluntários (ativos, pendentes, inativos)
- Lista de cadastros recentes
- Ações rápidas para gerenciamento
- Localização: `client/src/pages/AdminDashboard.tsx`

#### 2. Gerenciar Voluntários (`/admin/volunteers`)
- Listagem completa de todos os voluntários
- Filtros por status, projeto e busca por texto
- Tabela com informações principais
- Ações: visualizar, editar, excluir
- Localização: `client/src/pages/AdminVolunteers.tsx`

#### 3. Visualizar Voluntário (`/admin/volunteers/:id`)
- Visualização detalhada de um voluntário específico
- Informações pessoais, profissionais e de atendimento
- Disponibilidade de horários
- Ações rápidas (editar, enviar email, ligar)
- Localização: `client/src/pages/AdminVolunteerView.tsx`

#### 4. Editar Voluntário (`/admin/volunteers/:id/edit`)
- Formulário completo de edição
- Todos os campos editáveis
- Alteração de status (ativo/pendente/inativo)
- Validação com Zod
- Localização: `client/src/pages/AdminVolunteerEdit.tsx`

## 🛣️ Estrutura de Rotas

### Rotas Públicas
```
/                    → Home
/login               → Página de Login
/unauthorized        → Acesso Negado
/success             → Sucesso no Cadastro
```

### Rotas de Profissionais (Autenticação Obrigatória)
```
/register            → Formulário de Cadastro
/my-profile          → Meu Perfil
```

### Rotas Administrativas (Role Admin Obrigatório)
```
/admin/dashboard              → Dashboard Principal
/admin/volunteers             → Lista de Voluntários
/admin/volunteers/:id         → Visualizar Voluntário
/admin/volunteers/:id/edit    → Editar Voluntário
```

### Rotas Legadas (Mantidas para Compatibilidade)
```
/volunteers                   → Lista (redireciona para admin)
/volunteers/:id               → Visualizar (redireciona para admin)
/volunteers/:id/edit          → Editar (redireciona para admin)
```

## 🔐 Fluxo de Autenticação

### 1. Login
```
Usuário acessa /login
  ↓
Clica em "Entrar"
  ↓
Redireciona para /api/auth/login (Manus OAuth)
  ↓
Após autenticação, retorna ao sistema
  ↓
AuthContext verifica role do usuário
  ↓
Redireciona baseado no role:
  - Admin → /admin/dashboard
  - User → /register
```

### 2. Proteção de Rotas
```
Usuário tenta acessar rota protegida
  ↓
ProtectedRoute verifica autenticação
  ↓
Se não autenticado → /login
  ↓
Se autenticado mas sem permissão → /unauthorized
  ↓
Se autorizado → Renderiza componente
```

### 3. Logout
```
Usuário clica em "Sair"
  ↓
AuthContext.logout() é chamado
  ↓
Mutation para /api/auth/logout
  ↓
Cookie de sessão é removido
  ↓
Redireciona para /
```

## 🎨 Componentes UI Utilizados

O sistema utiliza componentes do **shadcn/ui**:

- `Button` - Botões de ação
- `Card` - Cards de conteúdo
- `Input` - Campos de entrada
- `Select` - Seleção de opções
- `Table` - Tabelas de dados
- `Form` - Formulários com validação
- `AlertDialog` - Diálogos de confirmação
- `Badge` - Badges de status
- `Textarea` - Campos de texto longo

## 📊 Banco de Dados

### Tabela `users`
```sql
- id (int, PK)
- openId (varchar, unique)
- name (text)
- email (varchar)
- role (enum: 'user', 'admin')
- loginMethod (varchar)
- createdAt (timestamp)
- updatedAt (timestamp)
- lastSignedIn (timestamp)
```

### Definição de Roles
- **user**: Profissionais que podem se cadastrar como voluntários
- **admin**: Administradores com acesso total ao sistema

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
DATABASE_URL=mysql://...
OWNER_NAME=admin@healtharmy.com
```

### 2. Definir Usuário Admin

Para definir um usuário como admin, você pode:

**Opção 1: Via Código (recomendado)**
No arquivo `server/db.ts`, o sistema já verifica se o `openId` do usuário corresponde ao `ENV.ownerOpenId` e automaticamente define como admin.

**Opção 2: Via SQL Direto**
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

### 3. Instalar Dependências

Se ainda não instalou:
```bash
cd /home/ubuntu/project
pnpm install
```

## 🚀 Como Executar

### Desenvolvimento
```bash
cd /home/ubuntu/project
pnpm dev
```

### Build de Produção
```bash
pnpm build
pnpm start
```

## 🧪 Testando o Sistema

### 1. Testar Login de Profissional
1. Acesse `/login`
2. Clique em "Entrar como Profissional"
3. Complete o OAuth
4. Deve ser redirecionado para `/register`

### 2. Testar Login de Admin
1. Certifique-se de ter um usuário com role 'admin'
2. Acesse `/login`
3. Faça login
4. Deve ser redirecionado para `/admin/dashboard`

### 3. Testar Proteção de Rotas
1. Sem estar logado, tente acessar `/admin/dashboard`
2. Deve ser redirecionado para `/login`
3. Como usuário normal, tente acessar `/admin/dashboard`
4. Deve ser redirecionado para `/unauthorized`

## 📝 Notas Importantes

### Segurança
- Todas as rotas administrativas são protegidas no frontend
- **IMPORTANTE**: Adicione proteção no backend também nas rotas sensíveis
- O sistema usa cookies HTTP-only para sessões

### Melhorias Futuras Sugeridas
1. Adicionar middleware de autenticação no backend (tRPC)
2. Implementar refresh token
3. Adicionar logs de auditoria
4. Implementar recuperação de senha
5. Adicionar 2FA para admins
6. Criar página de relatórios (`/admin/reports`)

### Manutenção
- Backup do arquivo original: `client/src/App.tsx.backup`
- Todos os componentes seguem o padrão do projeto
- Código comentado em português para facilitar manutenção

## 🆘 Solução de Problemas

### Problema: Usuário não é redirecionado após login
**Solução**: Verifique se o AuthContext está carregando corretamente e se o tRPC está configurado.

### Problema: Erro "useAuth must be used within AuthProvider"
**Solução**: Certifique-se de que o AuthProvider envolve todos os componentes no App.tsx.

### Problema: Admin não consegue acessar painel
**Solução**: Verifique no banco de dados se o role está definido como 'admin'.

### Problema: Rotas não protegidas
**Solução**: Verifique se o ProtectedRoute está envolvendo o componente corretamente.

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do tRPC: https://trpc.io
- Documentação do Wouter: https://github.com/molefrog/wouter
- Documentação do shadcn/ui: https://ui.shadcn.com

---

**Desenvolvido para Health Army Volunteers**
Versão: 1.0.0
Data: Dezembro 2024
