import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Edit2, Calendar, Mail, Phone, User, Briefcase, Lock } from "lucide-react";
import Header from "@/components/Header";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const DAYS_OF_WEEK_MAP: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export default function MyProfile() {
  const { user, isAuthenticated, loading } = useAuth();

  // Buscar dados do voluntário baseado no email do usuário logado
  const { data: volunteers = [], isLoading: loadingList } = trpc.volunteers.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const myVolunteerBasic = volunteers.find((v) => v.email === user?.email);
  
  // Buscar dados completos com availability
  const { data: myVolunteer, isLoading: loadingVolunteer } = trpc.volunteers.getById.useQuery(
    { id: myVolunteerBasic?.id || 0 },
    { enabled: !!myVolunteerBasic?.id }
  );
  
  const loadingVolunteers = loadingList || loadingVolunteer;

  if (loading || loadingVolunteers) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Meu Perfil" showBackButton backLink="/" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#53245c]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Meu Perfil" showBackButton backLink="/" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto text-[#53245c] mb-4" />
          <h1 className="text-3xl font-bold text-[#53245c] mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-8">
            Você precisa estar autenticado para acessar seu perfil.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white">
              Fazer Login
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (!myVolunteer) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Meu Perfil" showBackButton backLink="/" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <User className="h-16 w-16 mx-auto text-[#53245c] mb-4" />
          <h1 className="text-3xl font-bold text-[#53245c] mb-4">
            Perfil Não Encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            Você ainda não completou seu cadastro como voluntário.
          </p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white">
              Completar Cadastro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Meu Perfil" showBackButton backLink="/" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6 border-[#33b9cb]/20">
          <CardHeader className="bg-gradient-to-r from-[#53245c]/10 to-[#33b9cb]/10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-[#53245c]">{myVolunteer.fullName}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {myVolunteer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {myVolunteer.phone}
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={myVolunteer.status === "ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {myVolunteer.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
                <Badge className={myVolunteer.modality === "online" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                  {myVolunteer.modality === "online" ? "Online" : "Presencial"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Especialidade
                  </Label>
                  <p className="text-slate-900 mt-1">{myVolunteer.specialization}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Registro Profissional</Label>
                  <p className="text-slate-900 mt-1">{myVolunteer.professionalRegistration}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Projeto</Label>
                  <p className="text-slate-900 mt-1">
                    {myVolunteer.project === "borahae_terapias" ? "Bora Hae Terapias" : "Purple Army"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Tipo de Atendimento</Label>
                  <p className="text-slate-900 mt-1 capitalize">{myVolunteer.serviceType.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Frequência</Label>
                  <p className="text-slate-900 mt-1 capitalize">{myVolunteer.frequency}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Data de Cadastro</Label>
                  <p className="text-slate-900 mt-1">
                    {new Date(myVolunteer.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            {myVolunteer.notes && (
              <div className="mt-6 pt-6 border-t">
                <Label className="text-sm font-semibold text-slate-600">Observações</Label>
                <p className="text-slate-900 mt-2 whitespace-pre-wrap">{myVolunteer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Card */}
        <Card className="mb-6 border-[#33b9cb]/20">
          <CardHeader className="bg-gradient-to-r from-[#33b9cb]/10 to-[#33b9cb]/5">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#33b9cb]" />
              <CardTitle className="text-[#53245c]">Disponibilidade de Horários</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {myVolunteer.availability && myVolunteer.availability.length > 0 ? (
              <div className="grid gap-3">
                {myVolunteer.availability
                  .sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek)
                  .map((slot: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <span className="font-medium text-slate-700">
                          {DAYS_OF_WEEK_MAP[slot.dayOfWeek]}
                        </span>
                        <span className="text-slate-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-slate-600">Nenhuma disponibilidade cadastrada</p>
            )}
          </CardContent>
        </Card>

        {/* Edit Button */}
        <div className="flex justify-center">
          <Link href={`/volunteers/${myVolunteer.id}/edit`}>
            <Button className="bg-gradient-to-r from-[#33b9cb] to-[#2a8fa3] hover:from-[#2a8fa3] hover:to-[#1f6478] text-white px-8">
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Meu Perfil
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
