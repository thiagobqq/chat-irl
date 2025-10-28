import { Link } from "react-router-dom";
import { MessageCircle, Users, User, LogOut } from "lucide-react";
import { XPButton } from "./XPButton";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const handleLogout = (): void => {
    console.log("Logout clicado");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EAEFF] via-[#B7E3FF] to-white relative overflow-hidden font-segoe">
      {/* Background animado */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-float pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
              RetroChat XP
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/perfil">
              <XPButton>
                <User className="w-4 h-4" />
                Perfil
              </XPButton>
            </Link>
            <Link to="/chat">
              <XPButton>
                <MessageCircle className="w-4 h-4" />
                Conversas
              </XPButton>
            </Link>
            <Link to="/grupos">
              <XPButton>
                <Users className="w-4 h-4" />
                Grupos
              </XPButton>
            </Link>
            <XPButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sair
            </XPButton>
          </nav>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}