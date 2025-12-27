import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { trpc } from "@/lib/trpc";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!supabaseUser, // Só busca se tiver usuário do Supabase
  });

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();
  const updatePasswordMutation = trpc.auth.updatePassword.useMutation();

  // Monitorar mudanças na autenticação do Supabase
  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setIsInitialized(true);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      // Atualizar estado do Supabase
      setSupabaseUser(result.session.user);
      
      // Refetch user data
      await refetch();
    } catch (error: any) {
      throw new Error(error.message || "Erro ao fazer login");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await registerMutation.mutateAsync({ email, password, name });
      // Não faz login automático - usuário precisa confirmar email
    } catch (error: any) {
      throw new Error(error.message || "Erro ao criar conta");
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setSupabaseUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ email });
    } catch (error: any) {
      throw new Error(error.message || "Erro ao enviar email de recuperação");
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await updatePasswordMutation.mutateAsync({ newPassword });
    } catch (error: any) {
      throw new Error(error.message || "Erro ao atualizar senha");
    }
  };

  const isAuthenticated = !!supabaseUser && !!user;
  const isAdmin = user?.role === "admin";
  const isProfessional = user?.role === "user";

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized || isLoading,
    isAuthenticated,
    isAdmin,
    isProfessional,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
