import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Mail, Phone, Calendar, Lock } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function VolunteersList() {
  // TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  const { user, isAuthenticated, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch volunteers
  const { data: volunteers = [], isLoading, error } = trpc.volunteers.list.useQuery();

  // Filter volunteers
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchesSearch =
        volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.specialization.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = filterProject === "all" || volunteer.project === filterProject;
      const matchesStatus = filterStatus === "all" || volunteer.status === filterStatus;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [volunteers, searchTerm, filterProject, filterStatus]);

  // Get unique projects
  const projects = useMemo(() => {
    return Array.from(new Set(volunteers.map((v) => v.project)));
  }, [volunteers]);

  const getProjectLabel = (project: string) => {
    const labels: Record<string, string> = {
      borahae_terapias: "Bora Hae Terapias",
      saude_mental: "Saúde Mental",
      telemedicina: "Telemedicina",
      urgencia: "Urgência",
    };
    return labels[project] || project;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "inativo":
        return "bg-red-100 text-red-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getModalityColor = (modality: string) => {
    return modality === "online"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  // VERIFICAÇÕES CONDICIONAIS APÓS TODOS OS HOOKS
  // Verificar autenticação e permissão
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Painel Admin" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#53245c]" />
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Painel Admin" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto text-[#53245c] mb-4" />
          <h1 className="text-3xl font-bold text-[#53245c] mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-8">
            Você precisa estar autenticado para acessar o painel administrativo.
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
  
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Painel Admin" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto text-[#53245c] mb-4" />
          <h1 className="text-3xl font-bold text-[#53245c] mb-4">
            Acesso Não Autorizado
          </h1>
          <p className="text-gray-600 mb-8">
            Apenas administradores podem acessar o painel de gerenciamento de voluntários.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white">
              Voltar para Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <Header title="Painel de Voluntários" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add New Volunteer Button */}
        <div className="mb-6 flex justify-end">
          <Link href="/register">
            <Button className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] hover:from-[#3d1a45] hover:to-[#2a8fa3] text-white">
              + Novo Voluntário
            </Button>
          </Link>
        </div>
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Pesquise e filtre voluntários por nome, email, projeto ou status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Project Filter */}
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {getProjectLabel(project)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchTerm || filterProject !== "all" || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterProject("all");
                    setFilterStatus("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Volunteers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Voluntários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#33b9cb]" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Erro ao carregar voluntários</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">
                  {volunteers.length === 0
                    ? "Nenhum voluntário cadastrado ainda"
                    : "Nenhum voluntário corresponde aos filtros"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {volunteer.fullName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {volunteer.email}
                          </div>
                        </TableCell>
                        <TableCell>{volunteer.specialization}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getProjectLabel(volunteer.project)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getModalityColor(volunteer.modality)}>
                            {volunteer.modality === "online" ? "Online" : "Presencial"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(volunteer.status)}>
                            {volunteer.status === "ativo"
                              ? "Ativo"
                              : volunteer.status === "inativo"
                                ? "Inativo"
                                : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/volunteers/${volunteer.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredVolunteers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total de Voluntários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#53245c]">
                  {filteredVolunteers.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredVolunteers.filter((v) => v.status === "ativo").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredVolunteers.filter((v) => v.modality === "online").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Presencial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {filteredVolunteers.filter((v) => v.modality === "presencial").length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
