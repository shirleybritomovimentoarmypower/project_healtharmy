import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { UserCircle, Shield, Heart, Users, Calendar, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar usuários autenticados para suas páginas apropriadas
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/volunteers");
      } else {
        setLocation("/register");
      }
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#53245c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src="/health-army-logo.png" alt="Health Army" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold">Health Army</h1>
              <p className="text-sm text-white/80">Gestão de Voluntários</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#53245c]/5 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#53245c] mb-6">
            Bem-vindo ao Sistema de Gestão de Voluntários
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cadastre-se como voluntário, gerencie sua disponibilidade e contribua para transformar vidas através da saúde.
          </p>
        </div>
      </section>

      {/* Access Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#53245c] mb-12">
            Escolha seu tipo de acesso
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profissional Card */}
            <Card className="border-2 border-[#33b9cb] hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-[#33b9cb]/10 to-[#33b9cb]/5 border-b border-[#33b9cb]/20">
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="h-10 w-10 text-[#33b9cb]" />
                  <CardTitle className="text-2xl text-[#53245c]">Sou Profissional</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Cadastre-se como voluntário e comece a ajudar
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-gray-600">
                  Preencha o formulário com seus dados, especialidade e disponibilidade de horários. 
                  Nosso sistema sincronizará automaticamente com o Google Agenda.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#33b9cb] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Cadastro rápido e intuitivo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#33b9cb] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Gerencie sua disponibilidade</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#33b9cb] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Edite seu perfil a qualquer momento</p>
                  </div>
                </div>

                <a href={getLoginUrl()} className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-[#33b9cb] to-[#2a8fa3] hover:from-[#2a8fa3] hover:to-[#1f6478] text-white text-lg py-6">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Acessar como Profissional
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Administrador Card */}
            <Card className="border-2 border-[#ccd41c] hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-[#ccd41c]/10 to-[#ccd41c]/5 border-b border-[#ccd41c]/20">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-10 w-10 text-[#53245c]" />
                  <CardTitle className="text-2xl text-[#53245c]">Sou Administrador</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Gerencie todos os voluntários cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-gray-600">
                  Visualize, edite e gerencie todos os voluntários em um único painel centralizado. 
                  Acompanhe disponibilidades e atualizações de perfil.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#ccd41c] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Painel administrativo completo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#ccd41c] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">CRUD completo de voluntários</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#ccd41c] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Filtros e busca avançada</p>
                  </div>
                </div>

                <a href={getLoginUrl()} className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-[#53245c] to-[#3d1a46] hover:from-[#3d1a46] hover:to-[#2a1230] text-white text-lg py-6">
                    <Shield className="mr-2 h-5 w-5" />
                    Acessar como Administrador
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#53245c] mb-12">
            Funcionalidades Principais
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#33b9cb]/20">
              <CardHeader>
                <Heart className="h-12 w-12 text-[#33b9cb] mb-4" />
                <CardTitle className="text-xl">Cadastro Simplificado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Formulário intuitivo com validação completa de dados e feedback em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#33b9cb]/20">
              <CardHeader>
                <Calendar className="h-12 w-12 text-[#33b9cb] mb-4" />
                <CardTitle className="text-xl">Gestão de Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Defina seus horários de atendimento por dia da semana com flexibilidade total.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#33b9cb]/20">
              <CardHeader>
                <Users className="h-12 w-12 text-[#33b9cb] mb-4" />
                <CardTitle className="text-xl">Painel Administrativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualize e gerencie todos os voluntários em um único painel centralizado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para fazer a diferença?
          </h3>
          <p className="text-xl mb-8 text-white/90">
            Junte-se aos voluntários do Health Army e ajude a transformar vidas através de atendimentos de saúde de qualidade.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-white text-[#53245c] hover:bg-gray-100 text-lg px-8 py-6">
              Comece Agora
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2025 Health Army. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
