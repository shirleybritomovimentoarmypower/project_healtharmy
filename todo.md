# Health Army - Gestão de Voluntários - TODO

## Funcionalidades Principais

### Banco de Dados e Backend
- [x] Projetar schema do banco de dados para voluntários
- [x] Criar tabela de voluntários com campos obrigatórios
- [x] Criar tabela de disponibilidade de horários
- [x] Implementar migrations do Drizzle
- [x] Criar query helpers em server/db.ts
- [x] Implementar tRPC procedures para criar voluntário
- [x] Implementar tRPC procedures para listar voluntários (admin)
- [x] Implementar tRPC procedures para atualizar voluntário
- [x] Implementar tRPC procedures para deletar voluntário
- [x] Escrever testes vitest para procedures

### Frontend - Formulário
- [x] Criar página de cadastro de voluntários
- [x] Implementar validação de campos obrigatórios
- [x] Criar componente de seleção de tipo de atendimento
- [x] Criar componente de seleção de modalidade de atendimento
- [x] Criar componente de coleta de disponibilidade de horários
- [x] Implementar feedback visual de sucesso/erro
- [x] Implementar mensagens de erro específicas por campo

### Frontend - Layout e Navegação
- [x] Criar layout principal da aplicação
- [x] Implementar navegação clara e intuitiva
- [x] Adicionar página de confirmação após cadastro
- [x] Implementar página de listagem de voluntários (admin)
- [x] Criar componente de header reutilizável
- [x] Adicionar nome do usuário logado na navbar
- [x] Adicionar botão de logout na navbar
- [x] Criar página de detalhes do voluntário (/volunteers/:id)

### Funcionalidades de Perfil
- [x] Visualizar detalhes completos do voluntário
- [x] Visualizar disponibilidade de horários
- [x] Deletar voluntário com confirmação
- [x] Implementar edição de dados pessoais
- [x] Implementar edição de disponibilidade de horários

### Design e Branding
- [x] Atualizar paleta de cores (Tailwind CSS)
- [x] Integrar logo do Health Army
- [x] Redesenhar formulário com cores oficiais
- [x] Redesenhar página de sucesso
- [x] Aplicar design consistente em todas as páginas
- [x] Validar contraste e acessibilidade das cores

### Testes e Qualidade
- [x] Testar fluxo completo de cadastro (vitest)
- [x] Validar persistência de dados no banco
- [x] Testar validação de campos
- [x] Testar procedures tRPC (18 testes passando)
- [ ] Testar responsividade em mobile (320px-480px)
- [ ] Testar responsividade em tablet (768px-1024px)
- [ ] Testar responsividade em desktop (1024px+)
- [ ] Validar acessibilidade WCAG 2.1 Level AA
- [ ] Testar navegabilidade com teclado
- [ ] Testar menu mobile em diferentes tamanhos

## Notas de Implementação
- Usar Zod para validação de schema
- Usar React Hook Form para gerenciamento de formulário
- Usar shadcn/ui para componentes de UI
- Usar Tailwind CSS 4 para estilização
- Implementar otimistic updates quando apropriado
- Armazenar timestamps em UTC no banco de dados
- Cores oficiais: Roxo (#53245c), Branco (#ffffff), Ciano (#33b9cb), Amarelo (#ccd41c)

## Próximos Passos Recomendados
- [ ] Implementar edição de perfil (PUT /volunteers/:id)
- [ ] Integração com Google Calendar
- [ ] Sistema de notificações por email
- [ ] Dashboard com estatísticas
- [ ] Exportar dados em CSV/PDF
- [ ] Agendamento automático de atendimentos


## Funcionalidades Pendentes - Sprint 2

### Autenticação OAuth
- [x] Implementar login com Manus OAuth
- [x] Implementar logout
- [x] Exibir nome do usuário logado no header
- [x] Proteger rotas que requerem autenticação
- [x] Criar usuário admin para teste

### Sistema de Email
- [x] Integrar serviço de email (Manus Notification API)
- [x] Criar template de confirmação de cadastro
- [x] Enviar email após cadastro bem-sucedido
- [x] Criar template de notificação para admin
- [x] Enviar notificação ao admin quando novo voluntário se cadastra

### Edição de Perfil
- [x] Criar página de edição de perfil (/volunteers/:id/edit)
- [x] Implementar formulário de edição de dados pessoais
- [x] Implementar edição de disponibilidade de horários
- [x] Validar dados na edição
- [x] Implementar procedure PUT /volunteers/:id
- [x] Feedback visual de sucesso na edição

### Dashboard Admin Acessível
- [x] Adicionar link de login no header
- [x] Proteger rota /volunteers com autenticação
- [x] Verificar role "admin" antes de exibir painel
- [x] Criar usuário admin padrão
- [x] Testar acesso ao painel


## Reestruturação de Autenticação - Sprint 3

### Página Inicial
- [x] Criar página inicial com dois cards: "Sou Profissional" e "Sou Administrador"
- [x] Redirecionar ambos para login OAuth
- [x] Implementar redirecionamento pós-login baseado em role

### Proteção de Rotas
- [x] Proteger formulário de cadastro (apenas usuários autenticados)
- [x] Proteger painel admin (apenas role: admin)
- [x] Criar página de perfil do profissional (role: user)

### Fluxos de Acesso
- [x] Profissionais: Login → Formulário de cadastro → Visualização/edição do próprio perfil
- [x] Administradores: Login → Painel admin → CRUD completo de voluntários
- [x] Implementar mensagens de acesso restrito


## Bugs Reportados

- [x] Corrigir erro de hooks no VolunteersList ("Rendered more hooks than during the previous render") - RESOLVIDO

## Integração com Google Agenda (Prioridade Máxima)

### Sincronização de Calendário
- [ ] Configurar Google Cloud Console para API do Google Calendar
- [ ] Implementar fluxo OAuth2 para permissões de calendário
- [ ] Sincronizar disponibilidade do voluntário com Google Agenda
- [ ] Criar eventos automáticos no calendário após agendamentos
- [ ] Notificar voluntários via Google Calendar sobre novos atendimentos
