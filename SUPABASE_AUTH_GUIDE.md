# 🔐 Guia de Autenticação com Supabase

## Visão Geral

Este documento descreve o sistema de autenticação do Health Army Volunteers usando **Supabase Auth**, que substitui o Manus OAuth anterior.

O Supabase Auth oferece autenticação completa com email/senha, recuperação de senha, verificação de email, e gerenciamento de sessões de forma nativa e integrada ao banco de dados PostgreSQL.

---

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Fluxo de Autenticação](#fluxo-de-autenticação)
4. [Roles e Permissões](#roles-e-permissões)
5. [Implementação](#implementação)
6. [Uso no Frontend](#uso-no-frontend)
7. [Segurança](#segurança)
8. [Troubleshooting](#troubleshooting)

---

## Arquitetura

### Componentes Principais

O sistema de autenticação é composto por:

**1. Supabase Auth (auth.users)**
- Tabela gerenciada pelo Supabase que armazena credenciais
- Gerencia autenticação, sessões e tokens JWT
- Envia emails de verificação e recuperação de senha

**2. Tabela users (public.users)**
- Tabela customizada sincronizada com auth.users
- Armazena informações adicionais (role, name, etc)
- Relaciona-se com outras tabelas do sistema

**3. AuthContext (Frontend)**
- Context React que gerencia estado de autenticação
- Integra Supabase Client com tRPC
- Fornece hooks para login, logout, etc

**4. Backend tRPC**
- Endpoints de autenticação (login, register, logout)
- Validação de tokens JWT
- Sincronização entre auth.users e public.users

### Fluxo de Dados

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│ Supabase Auth│────▶│ auth.users  │
│  (React)    │◀────│   (JWT)      │◀────│  (managed)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                         │
       │                                         │ trigger
       ▼                                         ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    tRPC     │────▶│   Backend    │────▶│public.users │
│  Endpoints  │◀────│  (Node.js)   │◀────│  (custom)   │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a criação do banco de dados

### 2. Obter Credenciais

Acesse **Settings > API** e copie:

- **Project URL**: `https://seu-projeto.supabase.co`
- **Anon Key**: Chave pública para uso no frontend
- **Service Role Key**: Chave privada para uso no backend (NUNCA exponha no frontend!)

### 3. Configurar Variáveis de Ambiente

Crie ou atualize o arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Database (Connection Pooling)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 4. Executar Migrações

Execute o comando para criar as tabelas:

```bash
pnpm db:push
```

Isso criará:
- Tabela `users` com UUID como primary key
- Enums para roles (`user`, `admin`)
- Tabelas de voluntários e disponibilidade

### 5. Criar Trigger de Sincronização (Opcional)

Para sincronizar automaticamente `auth.users` com `public.users`, execute no SQL Editor do Supabase:

```sql
-- Função para criar usuário na tabela public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após INSERT em auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Este trigger garante que todo usuário criado no Supabase Auth seja automaticamente adicionado à tabela `public.users`.

### 6. Configurar Email Templates (Opcional)

Acesse **Authentication > Email Templates** e customize:

- **Confirm signup**: Email de verificação de conta
- **Reset password**: Email de recuperação de senha
- **Magic Link**: Email de login sem senha (se habilitado)

---

## Fluxo de Autenticação

### Registro de Novo Usuário

```
1. Usuário preenche formulário (email, senha, nome)
   ↓
2. Frontend chama trpc.auth.register.mutate()
   ↓
3. Backend chama supabase.auth.signUp()
   ↓
4. Supabase cria usuário em auth.users
   ↓
5. Trigger cria registro em public.users (ou backend cria manualmente)
   ↓
6. Supabase envia email de verificação
   ↓
7. Usuário clica no link do email
   ↓
8. Conta é verificada e ativada
```

### Login

```
1. Usuário preenche email e senha
   ↓
2. Frontend chama trpc.auth.login.mutate()
   ↓
3. Backend chama supabase.auth.signInWithPassword()
   ↓
4. Supabase valida credenciais
   ↓
5. Supabase retorna JWT token e session
   ↓
6. Backend busca/cria usuário em public.users
   ↓
7. Frontend armazena session no localStorage
   ↓
8. AuthContext atualiza estado (user, isAuthenticated)
   ↓
9. Usuário é redirecionado baseado no role
```

### Logout

```
1. Usuário clica em "Sair"
   ↓
2. Frontend chama auth.logout()
   ↓
3. Backend chama supabase.auth.signOut()
   ↓
4. Session é invalidada
   ↓
5. Frontend limpa localStorage
   ↓
6. Usuário é redirecionado para home
```

### Recuperação de Senha

```
1. Usuário clica em "Esqueci a senha"
   ↓
2. Frontend chama trpc.auth.resetPassword.mutate()
   ↓
3. Backend chama supabase.auth.resetPasswordForEmail()
   ↓
4. Supabase envia email com link de recuperação
   ↓
5. Usuário clica no link
   ↓
6. Usuário é redirecionado para página de redefinição
   ↓
7. Usuário define nova senha
   ↓
8. Frontend chama trpc.auth.updatePassword.mutate()
   ↓
9. Senha é atualizada no Supabase
```

---

## Roles e Permissões

### Tipos de Usuários

O sistema possui dois tipos de usuários definidos pelo campo `role` na tabela `users`:

#### 1. Profissional (role: "user")

**Acesso:**
- Página de cadastro de voluntários (`/register`)
- Visualização do próprio perfil (`/my-profile`)
- Edição do próprio perfil

**Restrições:**
- Não pode acessar painel administrativo
- Não pode visualizar outros voluntários
- Não pode alterar status de cadastros

#### 2. Administrador (role: "admin")

**Acesso:**
- Dashboard administrativo (`/admin/dashboard`)
- Lista completa de voluntários (`/admin/volunteers`)
- Visualização detalhada de qualquer voluntário
- Edição de qualquer voluntário
- Alteração de status (ativo/pendente/inativo)
- Exclusão de voluntários

**Permissões Especiais:**
- Acesso a estatísticas e métricas
- Filtros avançados
- Busca por texto
- Exportação de dados (futuro)

### Como Tornar um Usuário Admin

Execute no SQL Editor do Supabase:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@healtharmy.com';
```

Ou via Drizzle Studio:

```bash
pnpm db:studio
```

Navegue até a tabela `users`, encontre o usuário e altere o campo `role` para `admin`.

---

## Implementação

### Backend (server/supabase.ts)

```typescript
import { createClient } from "@supabase/supabase-js";

// Cliente admin (usa service role key)
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Verificar token JWT
export async function verifySupabaseToken(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : user;
}

// Criar/atualizar usuário na tabela public.users
export async function getOrCreateUser(
  supabaseUserId: string,
  email: string,
  name?: string
) {
  // Buscar usuário existente
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, supabaseUserId))
    .limit(1);

  if (existing.length > 0) {
    // Atualizar lastSignedIn
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, supabaseUserId));
    return existing[0];
  }

  // Criar novo usuário
  const newUser = await db
    .insert(users)
    .values({
      id: supabaseUserId,
      email,
      name: name || null,
      role: "user",
    })
    .returning();

  return newUser[0];
}
```

### Frontend (contexts/AuthContext.tsx)

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function AuthProvider({ children }) {
  const [supabaseUser, setSupabaseUser] = useState(null);

  // Monitorar mudanças de autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    setSupabaseUser(result.session.user);
  };

  // ...resto do código
}
```

---

## Uso no Frontend

### Hook useAuth

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const {
    user,              // Dados do usuário
    isLoading,         // Estado de carregamento
    isAuthenticated,   // Se está autenticado
    isAdmin,           // Se é admin
    isProfessional,    // Se é profissional
    login,             // Função de login
    register,          // Função de registro
    logout,            // Função de logout
    resetPassword,     // Recuperar senha
    updatePassword,    // Atualizar senha
  } = useAuth();

  // Usar conforme necessário
}
```

### Exemplo: Página de Login

```typescript
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirecionamento automático via AuthContext
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### Proteção de Rotas

```typescript
<Route path="/admin/dashboard">
  <ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>
</Route>

<Route path="/register">
  <ProtectedRoute requireAuth={true}>
    <VolunteerForm />
  </ProtectedRoute>
</Route>
```

---

## Segurança

### Boas Práticas

**1. NUNCA exponha a Service Role Key no frontend**
```typescript
// ❌ ERRADO - Nunca faça isso!
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ CORRETO - Use apenas a Anon Key no frontend
const supabase = createClient(url, import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**2. Use Row Level Security (RLS) no Supabase**

Execute no SQL Editor:

```sql
-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio registro
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid() = id);

-- Política: Admins podem ver todos os registros
CREATE POLICY "Admins can view all records"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**3. Valide Roles no Backend**

```typescript
// Verificar se usuário é admin antes de permitir ação
if (ctx.user?.role !== 'admin') {
  throw new Error('Acesso negado');
}
```

**4. Use HTTPS em Produção**

Sempre use HTTPS para proteger tokens JWT e credenciais em trânsito.

**5. Configure Email Verification**

Exija verificação de email antes de permitir login:

```typescript
// No Supabase Dashboard:
// Authentication > Settings > Email Auth
// ✅ Enable email confirmations
```

---

## Troubleshooting

### Problema: "Missing Supabase environment variables"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verifique se as variáveis estão no .env
cat .env | grep SUPABASE

# Se não estiverem, adicione:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### Problema: "User not found in public.users"

**Causa:** Usuário existe em auth.users mas não em public.users

**Solução:**
```sql
-- Verificar usuários em auth.users
SELECT id, email FROM auth.users;

-- Verificar usuários em public.users
SELECT id, email FROM public.users;

-- Criar manualmente se necessário
INSERT INTO public.users (id, email, name, role)
VALUES ('uuid-do-usuario', 'email@exemplo.com', 'Nome', 'user');
```

### Problema: "Invalid login credentials"

**Causa:** Email ou senha incorretos, ou email não verificado

**Solução:**
1. Verificar se o email está correto
2. Verificar se a senha tem no mínimo 6 caracteres
3. Verificar se o email foi confirmado (checar inbox)
4. Reenviar email de confirmação se necessário

### Problema: "Session expired"

**Causa:** Token JWT expirou (padrão: 1 hora)

**Solução:**
O Supabase Client renova automaticamente o token. Se o problema persistir:

```typescript
// Forçar refresh do token
const { data, error } = await supabase.auth.refreshSession();
```

### Problema: "CORS error"

**Causa:** Domínio não autorizado no Supabase

**Solução:**
1. Acesse Supabase Dashboard → Authentication → URL Configuration
2. Adicione sua URL em "Site URL" e "Redirect URLs"
3. Em desenvolvimento: `http://localhost:3001`
4. Em produção: `https://seu-dominio.com`

---

## Recursos Adicionais

### Documentação Oficial

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Arquivos do Projeto

- `server/supabase.ts` - Configuração do Supabase no backend
- `server/routers.ts` - Endpoints de autenticação
- `client/src/contexts/AuthContext.tsx` - Context de autenticação
- `client/src/pages/LoginSupabase.tsx` - Página de login
- `client/src/pages/ForgotPassword.tsx` - Recuperação de senha
- `drizzle/schema.ts` - Schema do banco de dados

---

## Migração do Manus OAuth

Se você está migrando do Manus OAuth para Supabase Auth, siga estes passos:

### 1. Backup dos Dados

```bash
# Exportar usuários existentes
pnpm db:studio
# Exportar tabela users para CSV
```

### 2. Atualizar Schema

```sql
-- Alterar tipo do ID de integer para varchar(36)
ALTER TABLE users ALTER COLUMN id TYPE varchar(36);

-- Remover campos do Manus OAuth
ALTER TABLE users DROP COLUMN openId;
ALTER TABLE users DROP COLUMN loginMethod;
```

### 3. Criar Usuários no Supabase Auth

Para cada usuário existente:

```typescript
// Script de migração
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: user.email,
  email_confirm: true,
  user_metadata: {
    name: user.name,
  },
});

// Atualizar ID na tabela users
await db.update(users)
  .set({ id: data.user.id })
  .where(eq(users.email, user.email));
```

### 4. Notificar Usuários

Envie email para todos os usuários informando sobre a mudança e solicitando que redefinam suas senhas.

---

## Conclusão

O sistema de autenticação com Supabase Auth oferece uma solução robusta, segura e fácil de manter para o Health Army Volunteers.

Com autenticação nativa do PostgreSQL, emails automáticos, e gerenciamento de sessões, o Supabase simplifica significativamente a implementação e manutenção do sistema de autenticação.

Para dúvidas ou problemas, consulte a documentação oficial do Supabase ou abra uma issue no repositório do projeto.

---

**Desenvolvido para Health Army Volunteers**

**Data:** Dezembro 2024

**Versão:** 2.0 (Supabase Auth)
