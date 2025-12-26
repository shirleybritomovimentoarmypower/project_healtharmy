import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCircle, Shield } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isAdmin, isProfessional, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirecionar baseado no role do usuário
      if (isAdmin) {
        setLocation("/admin/dashboard");
      } else if (isProfessional) {
        setLocation("/register");
      }
    }
  }, [isAuthenticated, isAdmin, isProfessional, isLoading, setLocation]);

  const handleLogin = () => {
    // Redirecionar para o endpoint de OAuth do Manus
    window.location.href = "/api/auth/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/health-army-logo.png" 
            alt="Health Army Logo" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Health Army Volunteers
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Gestão de Voluntários
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card para Profissionais */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Profissionais</CardTitle>
              <CardDescription className="text-base">
                Cadastre-se como voluntário e ofereça seus serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Acesso ao formulário de cadastro</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Gerenciar seu perfil profissional</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Definir disponibilidade de horários</span>
                </p>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Entrar como Profissional
              </Button>
            </CardContent>
          </Card>

          {/* Card para Administração */}
          <Card className="hover:shadow-lg transition-shadow border-indigo-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">Administração</CardTitle>
              <CardDescription className="text-base">
                Gerencie todos os cadastros e voluntários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Painel administrativo completo</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>CRUD de voluntários</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Relatórios e estatísticas</span>
                </p>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                Entrar como Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Ao fazer login, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
