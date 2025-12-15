import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Unauthorized() {
  const [, setLocation] = useLocation();
  const { logout, isAdmin, isProfessional } = useAuth();

  const handleGoHome = () => {
    if (isAdmin) {
      setLocation("/admin/dashboard");
    } else if (isProfessional) {
      setLocation("/register");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">Acesso Negado</CardTitle>
          <CardDescription className="text-base">
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Esta área é restrita a usuários com permissões específicas. Se você
            acredita que deveria ter acesso, entre em contato com o
            administrador do sistema.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} className="w-full" variant="default">
              <Home className="mr-2 h-4 w-4" />
              Voltar para Início
            </Button>
            <Button
              onClick={() => logout()}
              className="w-full"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
