import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

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
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { verifySupabaseToken, getOrCreateUser } = await import("../supabase");
      const supabaseUser = await verifySupabaseToken(token);
      
      if (supabaseUser) {
        user = await getOrCreateUser(
          supabaseUser.id,
          supabaseUser.email!,
          supabaseUser.user_metadata?.name
        );
      }
    }
  } catch (error) {
    console.error("Context Auth Error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
