import { Link } from "react-router-dom";
// Apenas o MessageCircle é necessário do Lucide agora
import { MessageCircle } from "lucide-react"; 
import { XPButton } from "./XPButton";
import { useState, useEffect, useRef } from "react";
import { apiService } from "../Services/api";
import { signalRService } from "../Services/signalr";
import { useAuth } from "../Contexts";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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

  const backgroundStyle = user?.backgroundPicture 
    ? { 
        backgroundImage: `url(${user.backgroundPicture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(to bottom right, #5EAEFF, #B7E3FF, white)',
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
    <div 
      className="h-screen relative overflow-hidden font-segoe"
      style={backgroundStyle}
    >
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-float pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
      </div>

      {/* --- Header com Estilo Gota de Vidro --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-20 flex flex-col md:flex-row justify-between items-center px-6 py-3 gap-4 
          relative transition-transform duration-300 ease-in-out
          bg-white/20 backdrop-blur-lg
          border-t border-white/40 border-b border-white/10
          shadow-xl shadow-black/20
          ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`
        }
      >
        {/* Camada de brilho "gloss" para o header */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        {/* --- Logo Aqua (Sólido e Brilhante) --- */}
        <div className="relative z-10">
          <Link to="/home">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md border-t border-white/50 border-b border-blue-900/50">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-2.5 rounded-full bg-white/60 blur-sm" />
                <MessageCircle className="w-6 h-6 text-white relative z-10" />
              </div>
              <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)]">
                Chat
              </h1>
            </div>
          </Link>
        </div>

        {/* --- Navigation com Ícones do MSN --- */}
        <nav className="relative z-10 flex items-center gap-4 flex-wrap justify-center">
          <Link to="/perfil">
            <XPButton>
              <img src="/icons/profile.png" alt="Ícone de perfil" className="w-4 h-4" />
              Perfil
            </XPButton>
          </Link>
          <Link to="/chat">
            <XPButton>
              <img src="/icons/chat.png" alt="Ícone de conversas" className="w-4 h-4" />
              Conversas
            </XPButton>
          </Link>
          <Link to="/grupos">
            <XPButton>
              <img src="/icons/groups.png" alt="Ícone de grupos" className="w-4 h-4" />
              Grupos
            </XPButton>
          </Link>
          <XPButton onClick={handleLogout}>
            <img src="/icons/logout.png" alt="Ícone de sair" className="w-4 h-4" />
            Sair
          </XPButton>
        </nav>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="relative z-10 h-full overflow-y-auto pt-24 md:pt-20">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {!isHeaderVisible && (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-30 p-2 rounded-full transition-all
            bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-lg
            border border-white/20
            shadow-xl shadow-black/25
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.1)]"
          aria-label="Mostrar menu"
        >
          <MessageCircle className="w-5 h-5 text-white drop-shadow" />
        </button>
      )}
    </div>
  );
}