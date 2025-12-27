import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  Briefcase,
} from "lucide-react";
import Header from "@/components/Header";

export default function AdminVolunteerView() {
  const [, params] = useRoute("/admin/volunteers/:id");
  const [, setLocation] = useLocation();
  const volunteerId = params?.id ? parseInt(params.id) : 0;

  const { data: volunteer, isLoading } = trpc.volunteers.getById.useQuery(
    { id: volunteerId },
    { enabled: volunteerId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Voluntário não encontrado</p>
              <Button
                onClick={() => setLocation("/admin/volunteers")}
                className="mt-4"
              >
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      ativo: "bg-green-100 text-green-800",
      pendente: "bg-yellow-100 text-yellow-800",
      inativo: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin/volunteers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={() => setLocation(`/admin/volunteers/${volunteerId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{volunteer.fullName}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {volunteer.specialization}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadge(volunteer.status)}>
                    {volunteer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{volunteer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{volunteer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Registro Profissional</p>
                      <p className="font-medium">{volunteer.professionalRegistration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Projeto</p>
                      <p className="font-medium capitalize">
                        {volunteer.project.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                {volunteer.address && (
                  <div className="flex items-start gap-3 pt-4 border-t">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Endereço</p>
                      <p className="font-medium">{volunteer.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Atendimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tipo de Atendimento</p>
                    <p className="font-medium capitalize">
                      {volunteer.serviceType.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Modalidade</p>
                    <p className="font-medium capitalize">{volunteer.modality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duração da Sessão</p>
                    <p className="font-medium">{volunteer.sessionDuration} minutos</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Frequência</p>
                    <p className="font-medium capitalize">{volunteer.frequency}</p>
                  </div>
                </div>

                {volunteer.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Observações</p>
                    <p className="text-gray-700">{volunteer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Disponibilidade de Horários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {volunteer.availability && volunteer.availability.length > 0 ? (
                  <div className="space-y-3">
                    {volunteer.availability
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((avail) => (
                        <div
                          key={avail.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">
                            {daysOfWeek[avail.dayOfWeek]}
                          </span>
                          <span className="text-gray-600">
                            {avail.startTime} - {avail.endTime}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma disponibilidade cadastrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações do Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Data de Cadastro</p>
                  <p className="font-medium">
                    {new Date(volunteer.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última Atualização</p>
                  <p className="font-medium">
                    {new Date(volunteer.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID do Voluntário</p>
                  <p className="font-medium">#{volunteer.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation(`/admin/volunteers/${volunteerId}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Cadastro
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${volunteer.email}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`tel:${volunteer.phone}`)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
