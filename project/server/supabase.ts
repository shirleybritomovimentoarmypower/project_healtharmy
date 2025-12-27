import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados!");
}

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);
