import { describe, it, expect } from 'vitest';

describe('Setup Básico de Testes', () => {
  it('deve executar teste simples', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve ter variáveis de ambiente', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });
});
