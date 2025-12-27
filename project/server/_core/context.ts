import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "../supabase";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (supabaseUser && !error) {
        // Sincronizar usuário do Supabase com nosso banco de dados
        let dbUser = await db.getUserByOpenId(supabaseUser.id);
        
        if (!dbUser) {
          await db.upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
            email: supabaseUser.email || null,
            loginMethod: supabaseUser.app_metadata?.provider || 'supabase',
            lastSignedIn: new Date(),
          });
          dbUser = await db.getUserByOpenId(supabaseUser.id);
        } else {
          // Atualizar lastSignedIn
          await db.upsertUser({
            openId: dbUser.openId,
            lastSignedIn: new Date(),
          });
        }
        
        user = dbUser || null;
      }
    }
  } catch (error) {
    console.error("[Auth] Erro na autenticação Supabase:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
