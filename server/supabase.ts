import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Cliente Supabase para uso no servidor
 * Usa a service role key para operações administrativas
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Cliente Supabase padrão
 * Usa a anon key para operações normais
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verifica se um token JWT do Supabase é válido
 */
export async function verifySupabaseToken(token: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying Supabase token:", error);
    return null;
  }
}

/**
 * Obtém ou cria um usuário na tabela users baseado no auth.users do Supabase
 */
export async function getOrCreateUser(supabaseUserId: string, email: string, name?: string) {
  const { db } = await import("./db");
  const { users } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Verificar se o usuário já existe
  const existingUser = await db.select().from(users).where(eq(users.id, supabaseUserId)).limit(1);

  if (existingUser.length > 0) {
    // Atualizar lastSignedIn
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, supabaseUserId));

    return existingUser[0];
  }

  // Criar novo usuário
  const newUser = await db
    .insert(users)
    .values({
      id: supabaseUserId,
      email,
      name: name || null,
      role: "user",
      lastSignedIn: new Date(),
    })
    .returning();

  return newUser[0];
}
