#!/bin/bash

# Script de configuração do Supabase para Health Army Volunteers
# Este script ajuda a configurar o projeto com Supabase

echo "🚀 Health Army Volunteers - Setup Supabase"
echo "=========================================="
echo ""

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando .env a partir do .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure:"
    echo "   - DATABASE_URL com sua connection string do Supabase"
    echo "   - VITE_OAUTH_PORTAL_URL e VITE_APP_ID"
    echo "   - OWNER_OPEN_ID para definir o admin"
    echo ""
    read -p "Pressione ENTER após configurar o .env..."
fi

# Verificar se DATABASE_URL está configurada
source .env
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"your-password"* ]]; then
    echo "❌ DATABASE_URL não está configurada corretamente!"
    echo ""
    echo "📋 Passos para obter a connection string:"
    echo "   1. Acesse https://supabase.com"
    echo "   2. Vá em Settings > Database"
    echo "   3. Copie a Connection string (URI)"
    echo "   4. Cole no arquivo .env na variável DATABASE_URL"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL configurada!"
echo ""

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    pnpm install
else
    echo "✅ Dependências já instaladas!"
fi
echo ""

# Executar migrações
echo "🗄️  Executando migrações no Supabase..."
echo ""
pnpm drizzle-kit push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrações executadas com sucesso!"
    echo ""
    echo "🎉 Setup concluído!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Verifique as tabelas no dashboard do Supabase"
    echo "   2. Execute 'pnpm dev' para iniciar o servidor"
    echo "   3. Acesse http://localhost:3001"
    echo ""
    echo "📚 Documentação completa em: SUPABASE_INTEGRATION_GUIDE.md"
else
    echo ""
    echo "❌ Erro ao executar migrações!"
    echo ""
    echo "🔍 Possíveis causas:"
    echo "   - Connection string incorreta"
    echo "   - Senha incorreta"
    echo "   - Projeto Supabase não criado"
    echo "   - Problemas de rede/firewall"
    echo ""
    echo "📚 Consulte: SUPABASE_INTEGRATION_GUIDE.md"
    exit 1
fi
