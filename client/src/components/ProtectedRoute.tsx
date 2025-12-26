import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Se requer autenticação e usuário não está autenticado
      if (requireAuth && !isAuthenticated) {
        setLocation("/login");
        return;
      }

      // Se requer admin e usuário não é admin
      if (requireAdmin && !isAdmin) {
        setLocation("/unauthorized");
        return;
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, setLocation]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e requer autenticação, não renderizar nada
  // (o useEffect já redirecionou)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Se requer admin e não é admin, não renderizar nada
  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
