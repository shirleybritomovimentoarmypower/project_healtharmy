import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

export default function VolunteerSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <Header title="Cadastro Realizado" />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Card className="shadow-lg border-2 border-[#33b9cb]">
          <CardHeader className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white">
            <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
          </CardHeader>

          <CardContent className="pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <img
                src="/health-army-logo.png"
                alt="Health Army Logo"
                className="h-20 w-auto"
              />
            </div>
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-[#33b9cb]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                Obrigado por se voluntariar!
              </h2>
              <p className="text-slate-600">
                Seu cadastro foi recebido com sucesso. Em breve, a equipe do Health Army
                entrará em contato para confirmar seus dados e iniciar o processo de
                agendamento.
              </p>
            </div>

            <div className="bg-[#53245c]/5 border border-[#53245c]/20 rounded-lg p-4">
              <p className="text-sm text-[#53245c]">
                <strong>Próximos passos:</strong> Você receberá um e-mail com as instruções
                para acessar o Google Agenda e confirmar sua disponibilidade.
              </p>
            </div>

            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-[#53245c] to-[#33b9cb] hover:from-[#3d1a45] hover:to-[#2a8fa3] text-white">
                Voltar ao Início
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
