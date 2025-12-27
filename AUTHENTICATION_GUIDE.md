# Guia de Autenticação e Sistema Administrativo

## 📋 Visão Geral

Este documento descreve o sistema de autenticação e gerenciamento implementado no projeto Health Army Volunteers. O sistema utiliza o **Supabase Auth** para gerenciar usuários e sessões, com dois tipos de permissões distintas:

- **Profissionais (role: user)**: Acesso ao formulário de cadastro de voluntários e ao próprio perfil.
- **Administração (role: admin)**: Acesso completo ao painel administrativo com CRUD de voluntários.

## 🏗️ Arquitetura Implementada

### 1. Contexto de Autenticação (`AuthContext.tsx`)

Localização: `client/src/contexts/AuthContext.tsx`

**Funcionalidades:**
- Integração com o cliente Supabase (`@supabase/supabase-js`).
- Gerenciamento de estado de autenticação em tempo real.
- Verificação de role do usuário (admin/user) via tabela `public.users`.
- Funções de login, registro, logout e recuperação de senha.
- Hook `useAuth()` para acesso simplificado em toda a aplicação.

### 2. Componente de Proteção de Rotas (`ProtectedRoute.tsx`)

Localização: `client/src/components/ProtectedRoute.tsx`

**Funcionalidades:**
- Protege rotas que requerem autenticação.
- Protege rotas que requerem permissão de admin.
- Redireciona usuários não autenticados para `/login`.
- Redireciona usuários sem permissão para `/unauthorized`.

## 🔐 Fluxo de Autenticação

### 1. Login
```
Usuário acessa /login
  ↓
Preenche email e senha
  ↓
Frontend chama supabase.auth.signInWithPassword()
  ↓
Após sucesso, AuthContext busca dados complementares em public.users
  ↓
Redireciona baseado no role:
  - Admin → /admin/dashboard
  - User → /register (ou /my-profile se já cadastrado)
```

### 2. Registro
```
Usuário acessa /login (aba Criar Conta)
  ↓
Preenche email, senha e nome
  ↓
Frontend chama supabase.auth.signUp()
  ↓
Supabase cria usuário e envia email de confirmação
  ↓
Trigger no banco cria registro correspondente em public.users
```

### 3. Logout
```
Usuário clica em "Sair"
  ↓
AuthContext.logout() chama supabase.auth.signOut()
  ↓
Sessão local é limpa e usuário redirecionado para a Home
```

## 📄 Páginas Implementadas

### Páginas Públicas
- **Login (`/login`)**: Autenticação via Supabase.
- **Unauthorized (`/unauthorized`)**: Exibida em caso de falta de permissão.
- **Home (`/`)**: Landing page do projeto.

### Páginas de Profissionais (Requer Autenticação)
- **Formulário de Cadastro (`/register`)**: Cadastro de novos voluntários.
- **Meu Perfil (`/my-profile`)**: Visualização e edição dos dados do profissional.

### Páginas Administrativas (Requer Role Admin)
- **Dashboard (`/admin/dashboard`)**: Estatísticas e visão geral.
- **Gerenciar Voluntários (`/admin/volunteers`)**: Listagem e filtros.
- **Visualizar/Editar Voluntário**: Gestão individual de cadastros.

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente (.env)

```env
# Conexão direta com o banco
DATABASE_URL=postgresql://...

# Configurações do Supabase Auth
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 2. Definir Usuário Admin

Para elevar um usuário a administrador, execute no SQL Editor do Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@healtharmy.com';
```

## 📝 Notas de Segurança

- O sistema utiliza **Row Level Security (RLS)** no Supabase para proteger os dados no nível do banco.
- As chaves de API `VITE_SUPABASE_ANON_KEY` são seguras para uso no frontend, enquanto a `SUPABASE_SERVICE_ROLE_KEY` deve permanecer apenas no servidor.
- As sessões são gerenciadas automaticamente pelo SDK do Supabase via JWT.

---

**Desenvolvido para Health Army Volunteers**
Documentação atualizada para integração com Supabase Auth.
