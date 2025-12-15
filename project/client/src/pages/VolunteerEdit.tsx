import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

const editSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  specialization: z.string().min(1, "Especialidade é obrigatória"),
  professionalRegistration: z.string().min(1, "Registro profissional é obrigatório"),
  project: z.enum(["borahae_terapias", "purple_army"]),
  serviceType: z.enum(["gratuito", "valor_social", "ambos"]),
  modality: z.enum(["online", "presencial"]),
  frequency: z.enum(["semanal", "quinzenal", "pontual"]),
  notes: z.string().optional(),
  address: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function VolunteerEdit() {
  const [, params] = useRoute("/volunteers/:id/edit");
  const volunteerId = params?.id ? parseInt(params.id) : null;
  const [isLoading, setIsLoading] = useState(true);

  const { data: volunteer } = trpc.volunteers.getById.useQuery(
    { id: volunteerId! },
    { enabled: !!volunteerId }
  );

  const updateMutation = trpc.volunteers.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => {
        window.location.href = `/volunteers/${volunteerId}`;
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (volunteer) {
      reset({
        fullName: volunteer.fullName,
        email: volunteer.email,
        phone: volunteer.phone,
        specialization: volunteer.specialization,
        professionalRegistration: volunteer.professionalRegistration,
        project: volunteer.project as "borahae_terapias" | "purple_army",
        serviceType: volunteer.serviceType as "gratuito" | "valor_social" | "ambos",
        modality: volunteer.modality as "online" | "presencial",
        frequency: volunteer.frequency as "semanal" | "quinzenal" | "pontual",
        notes: volunteer.notes || "",
        address: volunteer.address || "",
      });
      setIsLoading(false);
    }
  }, [volunteer, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!volunteerId) return;
    await updateMutation.mutateAsync({
      id: volunteerId,
      data,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Editar Perfil" showBackButton backLink={`/volunteers/${volunteerId}`} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#53245c]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Editar Perfil" showBackButton backLink={`/volunteers/${volunteerId}`} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-[#33b9cb]/20">
          <CardHeader className="bg-gradient-to-r from-[#53245c]/5 to-[#33b9cb]/5 border-b border-[#33b9cb]/20">
            <CardTitle className="text-[#53245c]">Editar Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">1. Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      {...register("fullName")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      {...register("phone")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      {...register("address")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">2. Informações Profissionais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidade *
                    </label>
                    <input
                      {...register("specialization")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                    {errors.specialization && (
                      <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registro Profissional *
                    </label>
                    <input
                      {...register("professionalRegistration")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    />
                    {errors.professionalRegistration && (
                      <p className="text-red-500 text-sm mt-1">{errors.professionalRegistration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projeto *
                    </label>
                    <select
                      {...register("project")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    >
                      <option value="">Selecione um projeto</option>
                      <option value="borahae_terapias">Bora Hae Terapias</option>
                      <option value="purple_army">Purple Army</option>
                    </select>
                    {errors.project && (
                      <p className="text-red-500 text-sm mt-1">{errors.project.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo e Modalidade de Atendimento */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">3. Tipo e Modalidade de Atendimento</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Atendimento *
                    </label>
                    <select
                      {...register("serviceType")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    >
                      <option value="">Selecione</option>
                      <option value="gratuito">Gratuito</option>
                      <option value="valor_social">Valor Social</option>
                      <option value="ambos">Ambos</option>
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modalidade *
                    </label>
                    <select
                      {...register("modality")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    >
                      <option value="">Selecione</option>
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                    </select>
                    {errors.modality && (
                      <p className="text-red-500 text-sm mt-1">{errors.modality.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequência *
                    </label>
                    <select
                      {...register("frequency")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                    >
                      <option value="">Selecione</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="pontual">Pontual</option>
                    </select>
                    {errors.frequency && (
                      <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">4. Observações Adicionais</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  {...register("notes")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33b9cb]"
                  placeholder="Informe qualquer observação importante"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white hover:opacity-90"
                >
                  {isSubmitting || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Perfil"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
