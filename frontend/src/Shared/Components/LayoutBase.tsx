import { Link } from "react-router-dom";
import { MessageCircle, Users, User, LogOut } from "lucide-react";
import { XPButton } from "./XPButton";
import { useState, useEffect, useRef } from "react";
import { apiService } from "../Services/api";
import { signalRService } from "../Services/signalr";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleLogout = async (): Promise<void> => {
    try {
      
      await signalRService.disconnect();      
      apiService.clearToken();
      
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.reload();

      
    } catch (error) {
      apiService.clearToken();      
      window.location.reload();
    }
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;

      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#5EAEFF] via-[#B7E3FF] to-white relative overflow-hidden font-segoe">
      {/* Background animado */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-float pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
      </div>

      {/* Header Fixo */}
      <header
        className={`fixed top-0 left-0 right-0 z-20 flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4 backdrop-blur-sm bg-white/10 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Logo */}
        <Link to="/home">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
              Chat
            </h1>
          </div>
        </Link>

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
      <main ref={mainRef} className="relative z-10 h-full overflow-y-auto pt-24">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Botão para mostrar navbar quando escondida */}
      {!isHeaderVisible && (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all"
          aria-label="Mostrar menu"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}