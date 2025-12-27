# 🏥 Health Army Volunteers

Sistema de gestão de voluntários para o Health Army, com cadastro de profissionais, gerenciamento de disponibilidade e painel administrativo completo.

## 🚀 Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Node.js + Express + tRPC
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Autenticação:** Supabase Auth
- **UI:** shadcn/ui + Tailwind CSS
- **Deploy:** Vercel

## ✨ Funcionalidades

### Para Profissionais
- ✅ Cadastro completo de voluntários
- ✅ Gerenciamento de disponibilidade de horários
- ✅ Edição de perfil profissional
- ✅ Definição de especialização e modalidade de atendimento

### Para Administradores
- ✅ Dashboard com estatísticas em tempo real
- ✅ CRUD completo de voluntários
- ✅ Filtros avançados (status, projeto)
- ✅ Busca por nome, email ou especialização
- ✅ Visualização detalhada de cadastros
- ✅ Alteração de status (ativo/pendente/inativo)
- ✅ Exclusão com confirmação

## 🏗️ Estrutura do Projeto

```
health_army_volunteers/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React (Auth)
│   │   ├── pages/         # Páginas da aplicação
│   │   └── App.tsx        # App principal
│   └── public/            # Assets estáticos
├── server/                # Backend Node.js
│   ├── _core/            # Core do servidor
│   ├── routers.ts        # Rotas tRPC
│   └── db.ts             # Conexão com banco
├── drizzle/              # Schema do banco
│   └── schema.ts         # Definição das tabelas
├── api/                  # Funções serverless (Vercel)
│   ├── trpc.js          # Handler tRPC
│   └── oauth.js         # Handler OAuth
└── dist/                 # Build de produção
```

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- Conta no Supabase

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/health-army-volunteers.git
cd health-army-volunteers
```

### Passo 2: Instalar Dependências

```bash
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres

# Supabase Auth
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Admin
OWNER_NAME=admin@healtharmy.com
```

### Passo 4: Executar Migrações

```bash
pnpm db:push
```

### Passo 5: Iniciar o Servidor

```bash
pnpm dev
```

Acesse: http://localhost:3001

## 🚀 Deploy na Vercel

Para fazer deploy na Vercel, consulte o guia completo:

📖 **[VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)**

**Resumo rápido:**

1. Faça push do código para GitHub/GitLab
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

## 📚 Documentação

- **[SUPABASE_AUTH_GUIDE.md](./SUPABASE_AUTH_GUIDE.md)** - Sistema de autenticação (Supabase)
- **[SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md)** - Integração com Supabase
- **[VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)** - Deploy na Vercel
- **[QUICK_START.md](./QUICK_START.md)** - Guia rápido de instalação

## 🗄️ Banco de Dados

### Tabelas

**users** - Usuários do sistema
- Autenticação via Supabase Auth
- Roles: user, admin

**volunteers** - Voluntários cadastrados
- Dados pessoais e profissionais
- Especialização e modalidade
- Status: ativo, pendente, inativo

**volunteerAvailability** - Disponibilidade de horários
- Horários por dia da semana
- Relação com voluntários (cascade delete)

### Migrações

```bash
# Aplicar schema no banco
pnpm db:push

# Gerar arquivos de migração
pnpm db:generate

# Abrir Drizzle Studio (GUI)
pnpm db:studio
```

## 🔐 Autenticação

O sistema usa **Supabase Auth** com dois tipos de usuários:

### Profissionais (role: user)
- Acesso ao formulário de cadastro
- Visualização do próprio perfil
- Gerenciamento de disponibilidade

### Administradores (role: admin)
- Acesso ao painel administrativo
- CRUD completo de voluntários
- Dashboard com estatísticas
- Filtros e busca avançada

### Configurar Admin

Execute no SQL Editor do Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format
```

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Iniciar servidor de produção
pnpm check        # Verificar tipos TypeScript
pnpm format       # Formatar código com Prettier
pnpm test         # Executar testes
pnpm db:push      # Aplicar schema no banco
pnpm db:generate  # Gerar migrações
pnpm db:studio    # Abrir Drizzle Studio
```

## 🛠️ Desenvolvimento

### Adicionar Nova Página

1. Criar componente em `client/src/pages/`
2. Adicionar rota em `client/src/App.tsx`
3. Proteger rota se necessário com `ProtectedRoute`

### Adicionar Nova Rota API

1. Adicionar procedimento em `server/routers.ts`
2. Usar no frontend via `trpc.procedureName.useQuery()`

### Modificar Schema do Banco

1. Editar `drizzle/schema.ts`
2. Executar `pnpm db:push`
3. Verificar no Supabase dashboard

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 👥 Equipe

Desenvolvido por **Shirley Brito** para **Health Army** - Transformando vidas através da saúde.

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `/docs`
2. Abra uma issue no GitHub
3. Entre em contato com a equipe

---

**Health Army Volunteers** - Sistema de Gestão de Voluntários

Feito com ❤️ para ajudar quem ajuda
