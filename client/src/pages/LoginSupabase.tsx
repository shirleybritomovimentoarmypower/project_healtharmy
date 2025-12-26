import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginSupabase() {
  const [, setLocation] = useLocation();
  const { login, isLoading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Login realizado! Redirecionando...");
        // Redirecionar baseado no role será feito pelo AuthContext
        setLocation("/");
      } else {
        // Registro será implementado
        toast.error("Registro não disponível. Entre em contato com o administrador.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
      toast.error(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100">
            <Shield className="h-10 w-10 text-[#53245c]" />
          </div>
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-[#53245c]">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Entre com suas credenciais para acessar o painel"
                : "Preencha os dados abaixo para se cadastrar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {isLogin && (
                    <a
                      href="/forgot-password"
                      className="text-sm font-medium text-[#33b9cb] hover:underline"
                    >
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#53245c] to-[#33b9cb] hover:opacity-90 transition-opacity h-11 text-base font-semibold"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Cadastrando..."}
                  </>
                ) : (
                  isLogin ? "Entrar" : "Cadastrar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou continue com</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-[#33b9cb] hover:underline"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; 2025 Health Army. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
