import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backLink?: string;
}

export default function Header({ title, showBackButton, backLink }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Desconectado com sucesso");
    } catch (error) {
      toast.error("Erro ao desconectar");
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#53245c] to-[#33b9cb] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            {showBackButton && backLink && (
              <Link href={backLink}>
                <Button variant="ghost" className="text-white hover:bg-white/10 p-0">
                  ←
                </Button>
              </Link>
            )}
            <div>
              <Link href="/">
                <h1 className="text-xl font-bold cursor-pointer hover:opacity-80 transition">
                  Health Army
                </h1>
              </Link>
              {title && <p className="text-sm text-white/80">{title}</p>}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Bem-vindo, <strong>{user?.name || "Usuário"}</strong>
                  </span>
                </div>

                {user?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" className="text-white border-white hover:bg-white/10">
                      Painel Admin
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </a>
                <Link href="/register">
                  <Button className="bg-white text-[#53245c] hover:bg-white/90">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:bg-white/10 p-2 rounded"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 border-t border-white/20 pt-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm">
                  Bem-vindo, <strong>{user?.name || "Usuário"}</strong>
                </div>

                {user?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white/10"
                    >
                      Painel Admin
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-white border-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <a href={getLoginUrl()} className="w-full">
                  <Button variant="outline" className="w-full text-white border-white hover:bg-white/10">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </a>
                <Link href="/register">
                  <Button className="w-full bg-white text-[#53245c] hover:bg-white/90">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
