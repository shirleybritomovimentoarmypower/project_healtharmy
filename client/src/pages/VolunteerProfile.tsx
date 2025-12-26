import { useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

export default function VolunteerProfile() {
  const [, params] = useRoute("/volunteers/:id");
  const volunteerId = params?.id ? parseInt(params.id) : null;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch volunteer details
  const { data: volunteer, isLoading, error } = trpc.volunteers.getById.useQuery(
    { id: volunteerId || 0 },
    { enabled: !!volunteerId }
  );

  // Delete mutation
  const deleteVolunteerMutation = trpc.volunteers.delete.useMutation({
    onSuccess: () => {
      toast.success("Voluntário deletado com sucesso");
      setTimeout(() => {
        window.location.href = "/volunteers";
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar voluntário");
    },
  });

  const handleDelete = async () => {
    if (!volunteerId) return;
    setIsDeleting(true);
    try {
      await deleteVolunteerMutation.mutateAsync({ id: volunteerId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!volunteerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Voluntário não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Não foi possível encontrar o voluntário solicitado.
            </p>
            <Link href="/volunteers">
              <Button className="w-full">Voltar à Listagem</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <Header title="Detalhes do Voluntário" backLink="/volunteers" showBackButton />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#33b9cb]" />
          </div>
        ) : error || !volunteer ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Erro ao carregar voluntário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 mb-6">
                Não foi possível carregar os dados do voluntário.
              </p>
              <Link href="/volunteers">
                <Button>Voltar à Listagem</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Info Card */}
            <Card className="mb-6">
              <CardHeader className="bg-gradient-to-r from-[#53245c]/10 to-[#33b9cb]/10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{volunteer.fullName}</CardTitle>
                    <CardDescription className="mt-2">
                      {volunteer.email} • {volunteer.phone}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={volunteer.status === "ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {volunteer.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge className={volunteer.modality === "online" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                      {volunteer.modality === "online" ? "Online" : "Presencial"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-600">Especialidade</Label>
                      <p className="text-slate-900">{volunteer.specialization}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600">Registro Profissional</Label>
                      <p className="text-slate-900">{volunteer.professionalRegistration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600">Projeto</Label>
                      <p className="text-slate-900">{volunteer.project}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-600">Tipo de Atendimento</Label>
                      <p className="text-slate-900">{volunteer.serviceType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600">Data de Cadastro</Label>
                      <p className="text-slate-900">
                        {new Date(volunteer.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Disponibilidade de Horários</CardTitle>
              </CardHeader>
              <CardContent>
                {volunteer.availability && volunteer.availability.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {volunteer.availability.map((slot, index) => {
                      const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                      const dayName = typeof slot.dayOfWeek === 'number'
                        ? days[slot.dayOfWeek] || 'Dia'
                        : (slot.dayOfWeek as string).charAt(0).toUpperCase() + (slot.dayOfWeek as string).slice(1);
                      return (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <p className="font-semibold text-slate-900 mb-2">
                          {dayName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-600">Nenhuma disponibilidade cadastrada</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Link href={`/volunteers/${volunteerId}/edit`}>
                <Button className="flex-1 bg-gradient-to-r from-[#33b9cb] to-[#2a8fa3] hover:from-[#2a8fa3] hover:to-[#1f6478] text-white">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar Informações
                </Button>
              </Link>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Voluntário
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Deletar Voluntário?</h2>
              <p className="text-sm text-slate-600 mt-2">
                Tem certeza que deseja deletar {volunteer?.fullName}? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-4">
              <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  "Deletar"
                )}
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
