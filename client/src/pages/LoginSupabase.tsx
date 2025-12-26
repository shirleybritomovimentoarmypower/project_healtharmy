import { useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, User, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginSupabase() {
  const [, navigate] = useNavigate();
  const [, setLocation] = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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
        toast({
          title: "Login realizado!",
          description: "Redirecionando...",
        });
        // Redirecionar baseado no role será feito pelo AuthContext
        navigate("/");
      } else {
        // Registro será implementado
        toast({
          title: "Registro não disponível",
          description: "Entre em contato com o administrador",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
      toast({
        title: "Erro",
        description: err.message || "Erro ao fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Health Army
          </h1>
          <p className="text-gray-600">Sistema de Gestão de Voluntários</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Entre com suas credenciais para acessar o sistema"
                : "Crie uma conta para se cadastrar como voluntário"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
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
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                      disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  <>{isLogin ? "Entrar" : "Criar Conta"}</>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">
                  {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                </span>{" "}
                <Button
                  type="button"
                  variant="link"
                  className="px-1"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  disabled={isLoading}
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Desenvolvido com ❤️ para Health Army</p>
          <p className="mt-1">Subprojeto do Movimento Army Power</p>
        </div>
      </div>
    </div>
  );
}
