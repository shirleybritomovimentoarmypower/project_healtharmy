import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

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
  // TODOS OS HOOKS NO INÍCIO
  const [, params] = useRoute("/volunteers/:id/edit");
  const volunteerId = params?.id ? parseInt(params.id) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<number, { start: string; end: string }>>({});

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

      // Carregar disponibilidade existente
      if (volunteer.availability && volunteer.availability.length > 0) {
        const days = volunteer.availability.map((a: any) => a.dayOfWeek);
        const slots: Record<number, { start: string; end: string }> = {};
        
        volunteer.availability.forEach((a: any) => {
          slots[a.dayOfWeek] = {
            start: a.startTime,
            end: a.endTime,
          };
        });

        setSelectedDays(days);
        setTimeSlots(slots);
      }

      setIsLoading(false);
    }
  }, [volunteer, reset]);

  const handleDayToggle = (dayOfWeek: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayOfWeek) ? prev.filter((d) => d !== dayOfWeek) : [...prev, dayOfWeek]
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: "start" | "end", value: string) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field === "start" ? "start" : "end"]: value,
      },
    }));
  };

  const onSubmit = async (data: EditFormData) => {
    if (!volunteerId) return;

    // Validar disponibilidade
    if (selectedDays.length === 0) {
      toast.error("Selecione pelo menos um dia da semana");
      return;
    }

    const missingTimes = selectedDays.some(
      (day) => !timeSlots[day]?.start || !timeSlots[day]?.end
    );

    if (missingTimes) {
      toast.error("Preencha os horários para todos os dias selecionados");
      return;
    }

    // Construir array de disponibilidade
    const availability = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: timeSlots[day].start,
      endTime: timeSlots[day].end,
    }));

    await updateMutation.mutateAsync({
      id: volunteerId,
      data: {
        ...data,
        availability,
      } as any,
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

              {/* Disponibilidade de Horários */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">4. Disponibilidade de Horários</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione os dias da semana e horários em que você está disponível para atendimento.
                </p>
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onCheckedChange={() => handleDayToggle(day.value)}
                        />
                        <Label htmlFor={`day-${day.value}`} className="font-medium cursor-pointer">
                          {day.label}
                        </Label>
                      </div>

                      {selectedDays.includes(day.value) && (
                        <div className="grid grid-cols-2 gap-3 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor={`start-${day.value}`} className="text-sm">
                              Início
                            </Label>
                            <Input
                              id={`start-${day.value}`}
                              type="time"
                              value={timeSlots[day.value]?.start || ""}
                              onChange={(e) =>
                                handleTimeChange(day.value, "start", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-${day.value}`} className="text-sm">
                              Término
                            </Label>
                            <Input
                              id={`end-${day.value}`}
                              type="time"
                              value={timeSlots[day.value]?.end || ""}
                              onChange={(e) =>
                                handleTimeChange(day.value, "end", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-lg font-semibold text-[#53245c] mb-4">5. Observações Adicionais</h3>
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
