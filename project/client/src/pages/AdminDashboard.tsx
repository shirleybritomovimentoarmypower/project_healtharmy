import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Clock, Plus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: volunteers, isLoading } = trpc.volunteers.list.useQuery();

  const stats = {
    total: volunteers?.length || 0,
    active: volunteers?.filter((v) => v.status === "ativo").length || 0,
    pending: volunteers?.filter((v) => v.status === "pendente").length || 0,
    inactive: volunteers?.filter((v) => v.status === "inativo").length || 0,
  };

  const recentVolunteers = volunteers
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8" />
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-2">
                Bem-vindo, {user?.name || "Administrador"}
              </p>
            </div>
            <Button onClick={() => setLocation("/admin/volunteers")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Voluntário
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Voluntários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Voluntários ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Voluntários inativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Volunteers */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastros Recentes</CardTitle>
            <CardDescription>
              Últimos 5 voluntários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Carregando...</p>
            ) : recentVolunteers && recentVolunteers.length > 0 ? (
              <div className="space-y-4">
                {recentVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setLocation(`/admin/volunteers/${volunteer.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {volunteer.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {volunteer.specialization} • {volunteer.project.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          volunteer.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : volunteer.status === "pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {volunteer.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(volunteer.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum voluntário cadastrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20"
            onClick={() => setLocation("/admin/volunteers")}
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span>Gerenciar Voluntários</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-20"
            onClick={() => setLocation("/admin/volunteers?status=pendente")}
          >
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2" />
              <span>Aprovar Cadastros</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-20"
            onClick={() => setLocation("/admin/reports")}
          >
            <div className="text-center">
              <LayoutDashboard className="h-6 w-6 mx-auto mb-2" />
              <span>Relatórios</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
