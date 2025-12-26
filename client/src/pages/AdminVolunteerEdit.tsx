import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

const formSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  specialization: z.string().min(1, "Especialização é obrigatória"),
  professionalRegistration: z.string().min(1, "Registro profissional é obrigatório"),
  project: z.enum(["borahae_terapias", "purple_army"]),
  serviceType: z.enum(["gratuito", "valor_social", "ambos"]),
  modality: z.enum(["online", "presencial"]),
  sessionDuration: z.number().int().positive(),
  frequency: z.enum(["semanal", "quinzenal", "pontual"]),
  status: z.enum(["ativo", "inativo", "pendente"]),
  notes: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminVolunteerEdit() {
  const [, params] = useRoute("/admin/volunteers/:id/edit");
  const [, setLocation] = useLocation();
  const volunteerId = params?.id ? parseInt(params.id) : 0;

  const { data: volunteer, isLoading } = trpc.volunteers.getById.useQuery(
    { id: volunteerId },
    { enabled: volunteerId > 0 }
  );

  const updateMutation = trpc.volunteers.update.useMutation({
    onSuccess: () => {
      toast.success("Voluntário atualizado com sucesso!");
      setLocation(`/admin/volunteers/${volunteerId}`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar voluntário: ${error.message}`);
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      professionalRegistration: "",
      project: "borahae_terapias",
      serviceType: "gratuito",
      modality: "online",
      sessionDuration: 50,
      frequency: "semanal",
      status: "pendente",
      notes: "",
      address: "",
    },
  });

  useEffect(() => {
    if (volunteer) {
      form.reset({
        fullName: volunteer.fullName,
        email: volunteer.email,
        phone: volunteer.phone,
        specialization: volunteer.specialization,
        professionalRegistration: volunteer.professionalRegistration,
        project: volunteer.project,
        serviceType: volunteer.serviceType,
        modality: volunteer.modality,
        sessionDuration: volunteer.sessionDuration,
        frequency: volunteer.frequency,
        status: volunteer.status,
        notes: volunteer.notes || "",
        address: volunteer.address || "",
      });
    }
  }, [volunteer, form]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id: volunteerId,
      data,
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/admin/volunteers/${volunteerId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Voluntário</CardTitle>
            <CardDescription>
              Atualize as informações do cadastro do voluntário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone/WhatsApp</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área de Atuação</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="professionalRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registro Profissional</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Detalhes do Atendimento</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="project"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Projeto</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="borahae_terapias">
                                Borahae Terapias
                              </SelectItem>
                              <SelectItem value="purple_army">Purple Army</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Atendimento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gratuito">Gratuito</SelectItem>
                              <SelectItem value="valor_social">Valor Social</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="modality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalidade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="presencial">Presencial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sessionDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="quinzenal">Quinzenal</SelectItem>
                              <SelectItem value="pontual">Pontual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status do Cadastro</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Altere o status para aprovar ou desativar o voluntário
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Informações Adicionais</h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço (para atendimentos presenciais)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/admin/volunteers/${volunteerId}`)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
