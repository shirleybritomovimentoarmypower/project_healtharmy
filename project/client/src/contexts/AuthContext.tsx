import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export type UserRole = "user" | "admin";

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  loginMethod: string | null;
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
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isProfessional = user?.role === "user";

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized,
    isAuthenticated,
    isAdmin,
    isProfessional,
    logout,
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
