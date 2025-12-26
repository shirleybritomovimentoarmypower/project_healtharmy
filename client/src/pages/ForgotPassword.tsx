import { useState } from "react";
import { useNavigate } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [, navigate] = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
      toast({
        title: "Erro",
        description: err.message || "Erro ao enviar email de recuperação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Email Enviado!
              </CardTitle>
              <CardDescription className="text-center">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Verifique sua caixa de entrada e siga as instruções no email para redefinir sua senha.
                  O link expira em 1 hora.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-gray-600 space-y-2">
                <p>Não recebeu o email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verifique sua pasta de spam</li>
                  <li>Aguarde alguns minutos</li>
                  <li>Tente enviar novamente</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Voltar para o Login
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Enviar Novamente
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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
                <p className="text-xs text-gray-500">
                  Enviaremos um link para redefinir sua senha
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>Enviar Link de Recuperação</>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Button>
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
