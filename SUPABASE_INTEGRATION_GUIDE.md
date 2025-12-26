# 🚀 Guia de Integração com Supabase

## Visão Geral

Este guia descreve como o projeto Health Army Volunteers foi integrado com o **Supabase** (PostgreSQL) para gerenciamento de banco de dados.

---

## 📋 O Que Foi Alterado

### 1. Dependências Instaladas

As seguintes dependências foram adicionadas ao projeto:

```json
{
  "dependencies": {
    "drizzle-orm": "^0.45.1",
    "postgres": "^3.4.7",
    "@supabase/supabase-js": "^2.87.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.8"
  }
}
```

**Descrição:**
- `drizzle-orm` - ORM type-safe para PostgreSQL
- `postgres` - Driver PostgreSQL para Node.js
- `@supabase/supabase-js` - Cliente oficial do Supabase
- `drizzle-kit` - CLI para migrações do Drizzle

### 2. Schema do Banco de Dados

**Arquivo:** `drizzle/schema.ts`

O schema foi convertido de **MySQL** para **PostgreSQL** com as seguintes mudanças principais:

#### Mudanças de Tipos:

| MySQL | PostgreSQL |
|-------|------------|
| `int()` | `integer()` |
| `.autoincrement()` | `.generatedAlwaysAsIdentity()` |
| `mysqlTable()` | `pgTable()` |
| `mysqlEnum()` | `pgEnum()` |
| `.onUpdateNow()` | Removido (não suportado no PostgreSQL) |

#### Enums Criados:

```typescript
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const projectEnum = pgEnum("project", ["borahae_terapias", "purple_army"]);
export const serviceTypeEnum = pgEnum("service_type", ["gratuito", "valor_social", "ambos"]);
export const modalityEnum = pgEnum("modality", ["online", "presencial"]);
export const frequencyEnum = pgEnum("frequency", ["semanal", "quinzenal", "pontual"]);
export const statusEnum = pgEnum("status", ["ativo", "inativo", "pendente"]);
```

#### Estrutura das Tabelas:

**Tabela `users`:**
- `id` - Primary key com auto-increment
- `openId` - Identificador único do OAuth (unique)
- `name` - Nome do usuário
- `email` - Email do usuário
- `loginMethod` - Método de login utilizado
- `role` - Role do usuário (user/admin)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização
- `lastSignedIn` - Último login

**Tabela `volunteers`:**
- `id` - Primary key com auto-increment
- `fullName` - Nome completo
- `email` - Email de contato
- `phone` - Telefone/WhatsApp
- `specialization` - Área de atuação
- `professionalRegistration` - Registro profissional
- `project` - Projeto (enum)
- `serviceType` - Tipo de atendimento (enum)
- `modality` - Modalidade (enum)
- `sessionDuration` - Duração da sessão
- `frequency` - Frequência (enum)
- `notes` - Observações
- `address` - Endereço
- `status` - Status (enum)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

**Tabela `volunteerAvailability`:**
- `id` - Primary key com auto-increment
- `volunteerId` - Foreign key para volunteers (cascade delete)
- `dayOfWeek` - Dia da semana (0-6)
- `startTime` - Horário de início
- `endTime` - Horário de término
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### 3. Configuração do Drizzle

**Arquivo:** `drizzle.config.ts`

```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Alterado de "mysql" para "postgresql"
  dbCredentials: {
    url: connectionString,
  },
});
```

### 4. Conexão com o Banco de Dados

**Arquivo:** `server/db.ts`

A conexão foi completamente reescrita para usar PostgreSQL:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create postgres client
_client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
_db = drizzle(_client);
```

#### Mudanças Importantes:

**Upsert de Usuário:**
- MySQL usava `.onDuplicateKeyUpdate()`
- PostgreSQL usa `.onConflictDoUpdate()`

```typescript
await db
  .insert(users)
  .values(values)
  .onConflictDoUpdate({
    target: users.openId,
    set: { /* campos a atualizar */ },
  });
```

**Insert com Retorno:**
- MySQL retornava `insertId` no resultado
- PostgreSQL usa `.returning()` para obter o ID

```typescript
const result = await db
  .insert(volunteers)
  .values(volunteerData)
  .returning({ id: volunteers.id });

const volunteerId = result[0]?.id;
```

**Update Automático:**
- MySQL tinha `.onUpdateNow()` no schema
- PostgreSQL requer adicionar `updatedAt` manualmente

```typescript
const updateData = {
  ...data,
  updatedAt: new Date(),
};
```

---

## 🔧 Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados:
   - **Name:** health-army-volunteers
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha a região mais próxima
5. Aguarde a criação do projeto (1-2 minutos)

### Passo 2: Obter Connection String

1. No dashboard do projeto, vá em **Settings** (ícone de engrenagem)
2. Clique em **Database** no menu lateral
3. Role até **Connection string**
4. Selecione a aba **URI**
5. Copie a connection string (formato: `postgresql://postgres:[YOUR-PASSWORD]@...`)
6. Substitua `[YOUR-PASSWORD]` pela senha que você definiu

**Exemplo:**
```
postgresql://postgres:sua-senha-aqui@db.abcdefghijklmno.supabase.co:5432/postgres
```

### Passo 3: Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres

# Opcional: Supabase API (para uso direto do client)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**Para obter SUPABASE_URL e ANON_KEY:**
1. No dashboard, vá em **Settings** > **API**
2. Copie **Project URL** (VITE_SUPABASE_URL)
3. Copie **anon public** key (VITE_SUPABASE_ANON_KEY)

### Passo 4: Executar Migrações

Gere e execute as migrações do Drizzle:

```bash
# Gerar arquivos de migração
pnpm drizzle-kit generate

# Aplicar migrações no banco
pnpm drizzle-kit push
```

**Alternativa (Push direto):**
```bash
# Push schema diretamente sem gerar arquivos de migração
pnpm drizzle-kit push
```

### Passo 5: Verificar Tabelas no Supabase

1. No dashboard do Supabase, clique em **Table Editor**
2. Você deve ver as tabelas criadas:
   - `users`
   - `volunteers`
   - `volunteerAvailability`
3. Clique em cada tabela para ver a estrutura

---

## 🧪 Testando a Conexão

### Teste 1: Verificar Conexão

Execute o servidor e verifique os logs:

```bash
pnpm dev
```

Você deve ver:
```
[Database] Connected to PostgreSQL/Supabase successfully
```

### Teste 2: Criar Usuário Admin

Execute no SQL Editor do Supabase:

```sql
INSERT INTO users ("openId", name, email, role, "createdAt", "updatedAt", "lastSignedIn")
VALUES ('test-admin-123', 'Admin Test', 'admin@test.com', 'admin', NOW(), NOW(), NOW());
```

### Teste 3: Verificar no Dashboard

1. Acesse o site: `http://localhost:3001`
2. Faça login
3. Verifique se o usuário foi criado na tabela `users`

---

## 📊 Diferenças MySQL vs PostgreSQL

### Tipos de Dados

| Recurso | MySQL | PostgreSQL |
|---------|-------|------------|
| Auto-increment | `AUTO_INCREMENT` | `GENERATED ALWAYS AS IDENTITY` |
| Enum | Inline no schema | Definido separadamente com `pgEnum()` |
| Text | `TEXT` | `TEXT` |
| Integer | `INT` | `INTEGER` |
| Timestamp | `TIMESTAMP` | `TIMESTAMP` |

### Funcionalidades

| Recurso | MySQL | PostgreSQL |
|---------|-------|------------|
| Upsert | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT DO UPDATE` |
| Returning | Não nativo | `.returning()` nativo |
| Auto-update timestamp | `.onUpdateNow()` | Manual no código |
| Case sensitivity | Insensitive por padrão | Sensitive por padrão |

### Vantagens do PostgreSQL/Supabase

✅ **Conformidade com SQL:** Mais aderente aos padrões SQL

✅ **Tipos avançados:** Suporte a JSON, Arrays, UUID nativos

✅ **Performance:** Melhor performance em queries complexas

✅ **Extensibilidade:** Suporte a extensões (PostGIS, pg_vector, etc)

✅ **Supabase Features:**
- Dashboard visual completo
- SQL Editor integrado
- Autenticação integrada (opcional)
- Storage para arquivos
- Realtime subscriptions
- Edge Functions
- Backups automáticos

---

## 🔒 Segurança

### Row Level Security (RLS)

O Supabase suporta RLS para proteger dados. Para habilitar:

```sql
-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para admins
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Criar política para usuários verem apenas seus dados
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = "openId");
```

### Conexão Segura

A connection string do Supabase já usa SSL por padrão. Para garantir:

```typescript
_client = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }, // Para desenvolvimento
  // ssl: true, // Para produção
});
```

---

## 🚀 Deploy em Produção

### Variáveis de Ambiente

No seu serviço de deploy (Vercel, Railway, etc), configure:

```env
DATABASE_URL=postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres
NODE_ENV=production
```

### Connection Pooling

Para produção, use connection pooling do Supabase:

1. No dashboard, vá em **Settings** > **Database**
2. Role até **Connection Pooling**
3. Use a **Transaction Mode** connection string
4. Formato: `postgresql://postgres.xxx:6543/postgres`

```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Migrações

Execute as migrações antes do deploy:

```bash
pnpm drizzle-kit push
```

Ou configure CI/CD para executar automaticamente.

---

## 📝 Scripts Úteis

Adicione ao `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

**Uso:**

```bash
# Gerar migrações
pnpm db:generate

# Aplicar migrações
pnpm db:push

# Abrir Drizzle Studio (GUI)
pnpm db:studio

# Remover todas as tabelas (cuidado!)
pnpm db:drop
```

---

## 🆘 Solução de Problemas

### Erro: "relation does not exist"

**Causa:** Tabelas não foram criadas no banco.

**Solução:**
```bash
pnpm drizzle-kit push
```

### Erro: "password authentication failed"

**Causa:** Senha incorreta na connection string.

**Solução:** Verifique a senha no `.env` e no Supabase.

### Erro: "too many connections"

**Causa:** Limite de conexões atingido.

**Solução:** Use connection pooling ou aumente o limite no Supabase (Settings > Database > Connection Pooling).

### Erro: "SSL connection required"

**Causa:** Supabase requer SSL.

**Solução:** Adicione `?sslmode=require` na connection string:
```
postgresql://...?sslmode=require
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tutoriais

- [Supabase + Drizzle Integration](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Drizzle Migrations Guide](https://orm.drizzle.team/docs/migrations)

### Ferramentas

- [Supabase Dashboard](https://app.supabase.com)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - GUI para banco de dados

---

## ✅ Checklist de Integração

- [x] Dependências instaladas
- [x] Schema convertido para PostgreSQL
- [x] Configuração do Drizzle atualizada
- [x] Conexão com banco atualizada
- [x] Funções de CRUD adaptadas
- [x] Arquivo `.env.example` criado
- [ ] Projeto criado no Supabase
- [ ] Connection string configurada
- [ ] Migrações executadas
- [ ] Conexão testada
- [ ] Tabelas verificadas no dashboard

---

## 🎉 Conclusão

A integração com o Supabase foi concluída com sucesso! O projeto agora utiliza **PostgreSQL** como banco de dados com todas as vantagens do Supabase:

✅ Dashboard visual completo
✅ Backups automáticos
✅ Escalabilidade automática
✅ SSL por padrão
✅ Connection pooling
✅ SQL Editor integrado

**Próximos passos:**
1. Configure seu projeto no Supabase
2. Atualize o `.env` com a connection string
3. Execute as migrações
4. Teste a aplicação

---

**Desenvolvido para Health Army Volunteers**
Data: Dezembro 2024
