import { beforeAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

beforeAll(() => {
  // Carrega o .env.test
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
  
  // Fallback para .env se .env.test não existir
  if (!process.env.VITE_SUPABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  }
  
  // Verifica se as variáveis foram carregadas
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Variáveis de ambiente do Supabase não foram carregadas!');
  }
  
  console.log('✅ Variáveis de ambiente carregadas com sucesso');
});
