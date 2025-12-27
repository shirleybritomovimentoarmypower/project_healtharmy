import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Lock } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const volunteerFormSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
  specialization: z.string().min(1, "Especialidade é obrigatória"),
  professionalRegistration: z.string().min(1, "Registro profissional é obrigatório"),
  project: z.enum(["borahae_terapias", "purple_army"]),
  serviceType: z.enum(["gratuito", "valor_social", "ambos"]),
  modality: z.enum(["online", "presencial"]),
  sessionDuration: z.number().int().positive().default(50),
  frequency: z.enum(["semanal", "quinzenal", "pontual"]),
  notes: z.string().optional(),
  address: z.string().optional(),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});

type VolunteerFormData = z.infer<typeof volunteerFormSchema>;

export default function VolunteerForm() {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Verificar autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Cadastro de Voluntário" showBackButton backLink="/" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#53245c]" />
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Cadastro de Voluntário" showBackButton backLink="/" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto text-[#53245c] mb-4" />
          <h1 className="text-3xl font-bold text-[#53245c] mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-8">
            Você precisa estar autenticado para acessar o formulário de cadastro de voluntário.
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
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<number, { start: string; end: string }>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<any>({
    resolver: zodResolver(volunteerFormSchema) as any,
    defaultValues: {
      sessionDuration: 50,
      availability: [],
    },
  });

  const createVolunteerMutation = trpc.volunteers.create.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setSubmitError(null);
      reset();
      setSelectedDays([]);
      setTimeSlots({});
      toast.success("Voluntário cadastrado com sucesso!");
      setTimeout(() => setSubmitSuccess(false), 5000);
    },
    onError: (error) => {
      setSubmitError(error.message || "Erro ao cadastrar voluntário");
      toast.error("Erro ao cadastrar voluntário");
    },
  });

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

  const onSubmit = async (data: any) => {
    const formData = data as VolunteerFormData;
    // Validar que pelo menos um dia foi selecionado
    if (selectedDays.length === 0) {
      setSubmitError("Selecione pelo menos um dia da semana");
      toast.error("Selecione pelo menos um dia da semana");
      return;
    }

    // Validar que todos os dias selecionados têm horários
    const missingTimes = selectedDays.some(
      (day) => !timeSlots[day]?.start || !timeSlots[day]?.end
    );

    if (missingTimes) {
      setSubmitError("Preencha os horários para todos os dias selecionados");
      toast.error("Preencha os horários para todos os dias selecionados");
      return;
    }

    // Construir array de disponibilidade
    const availability = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: timeSlots[day].start,
      endTime: timeSlots[day].end,
    }));

    try {
      await createVolunteerMutation.mutateAsync({
        ...data,
        availability,
      } as any);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  const modality = watch("modality");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <Header title="Cadastro de Voluntário" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/health-army-logo.png"
                alt="Health Army Logo"
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-3xl">Cadastro de Voluntário</CardTitle>
            <CardDescription className="text-white/90">
              Health Army - Sistema de Gestão de Voluntários
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {submitSuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Cadastro realizado com sucesso! Obrigado por se voluntariar.
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-6 pb-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    1. Dados Pessoais
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      {...register("fullName")}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{(errors.fullName as any)?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{(errors.email as any)?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Telefone/WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(11) 98765-4321"
                      {...register("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{(errors.phone as any)?.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 2: Informações Profissionais */}
              <div className="space-y-6 pb-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    2. Informações Profissionais
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      Especialidade <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="specialization"
                      placeholder="Ex: Psicologia, Terapia Ocupacional"
                      {...register("specialization")}
                      className={errors.specialization ? "border-red-500" : ""}
                    />
                    {errors.specialization && (
                      <p className="text-sm text-red-500">{(errors.specialization as any)?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professionalRegistration">
                      Registro Profissional <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="professionalRegistration"
                      placeholder="Ex: CRP 06/123456"
                      {...register("professionalRegistration")}
                      className={errors.professionalRegistration ? "border-red-500" : ""}
                    />
                    {errors.professionalRegistration && (
                      <p className="text-sm text-red-500">
                        {(errors.professionalRegistration as any)?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">
                      Projeto <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="project"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            className={errors.project ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="borahae_terapias">Borahae Terapias</SelectItem>
                            <SelectItem value="purple_army">Purple Army</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.project && (
                      <p className="text-sm text-red-500">{(errors.project as any)?.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 3: Tipo e Modalidade de Atendimento */}
              <div className="space-y-6 pb-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    3. Tipo e Modalidade de Atendimento
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">
                      Tipo de Atendimento <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="serviceType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            className={errors.serviceType ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gratuito">Gratuito</SelectItem>
                            <SelectItem value="valor_social">Valor Social</SelectItem>
                            <SelectItem value="ambos">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.serviceType && (
                      <p className="text-sm text-red-500">{(errors.serviceType as any)?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modality">
                      Modalidade <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="modality"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            className={errors.modality ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="presencial">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.modality && (
                      <p className="text-sm text-red-500">{(errors.modality as any)?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">
                      Frequência <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            className={errors.frequency ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="pontual">Pontual</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.frequency && (
                      <p className="text-sm text-red-500">{(errors.frequency as any)?.message}</p>
                    )}
                  </div>
                </div>

                {modality === "presencial" && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea
                      id="address"
                      placeholder="Endereço completo para atendimentos presenciais"
                      {...register("address")}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Seção 4: Disponibilidade de Horários */}
              <div className="space-y-6 pb-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    4. Disponibilidade de Horários <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Selecione os dias em que você está disponível e informe os horários
                  </p>
                </div>

                <div className="space-y-4">
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

              {/* Seção 5: Observações */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    5. Observações Adicionais
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informe qualquer observação importante (ex: restrições, preferências, etc)"
                    {...register("notes")}
                    rows={4}
                  />
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting || createVolunteerMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#53245c] to-[#33b9cb] hover:from-[#3d1a45] hover:to-[#2a8fa3] text-white"
                >
                  {isSubmitting || createVolunteerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Voluntário"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedDays([]);
                    setTimeSlots({});
                    setSubmitError(null);
                  }}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
