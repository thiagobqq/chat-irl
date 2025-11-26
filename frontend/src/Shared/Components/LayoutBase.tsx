import { Link, useLocation } from "react-router-dom";
import { MessageCircle, User, Users, MessageSquare, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../Contexts";

interface LayoutProps {
  children: React.ReactNode;
}

const RetroIcon = ({ src, fallback: Fallback, className, title }: { src: string, fallback: any, className?: string, title?: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <Fallback className={className} title={title} />;
  }

  return (
    <img 
      src={src} 
      className={className} 
      title={title} 
      style={{ imageRendering: 'pixelated', display: 'block' }} 
      alt="icon"
      onError={() => setError(true)}
    />
  );
};

const ICONS_URL = {
  MESSENGER: "https://win98icons.alexmeub.com/icons/png/msn2-4.png",
  PROFILE: "https://win98icons.alexmeub.com/icons/png/user-2.png",
  CHAT: "https://win98icons.alexmeub.com/icons/png/write_wordpad-0.png",
  GROUPS: "https://win98icons.alexmeub.com/icons/png/users-0.png",
  MENU: "https://win98icons.alexmeub.com/icons/png/application_hourglass-0.png",
};

const Icons = {
  Messenger: (props: any) => <RetroIcon src={ICONS_URL.MESSENGER} fallback={MessageCircle} {...props} />,
  Profile: (props: any) => <RetroIcon src={ICONS_URL.PROFILE} fallback={User} {...props} />,
  Chat: (props: any) => <RetroIcon src={ICONS_URL.CHAT} fallback={MessageSquare} {...props} />,
  Groups: (props: any) => <RetroIcon src={ICONS_URL.GROUPS} fallback={Users} {...props} />,
  Menu: (props: any) => <RetroIcon src={ICONS_URL.MENU} fallback={Menu} {...props} />,
};

export default function Layout({ children }: LayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const location = useLocation();

  const backgroundStyle = user?.backgroundPicture 
    ? { 
        backgroundImage: `url(${user.backgroundPicture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, #daffdbff 0%, #d0eeffff 100%)',
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className="h-screen relative overflow-hidden font-tahoma"
      style={backgroundStyle}
    >
      {!user?.backgroundPicture && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out
          ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div 
          className="bg-gradient-to-r from-[#0058EE] via-[#3B8CF4] to-[#0058EE] px-2 py-1 flex items-center justify-between border-b border-[#0044AA]"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="relative">
              <Icons.Messenger className="w-6 h-6" />
            </div>
            <span className="text-white font-bold text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              Chat
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button className="w-5 h-5 bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] border border-white/30 rounded-sm flex items-center justify-center text-white text-[10px] font-bold hover:brightness-110">
              _
            </button>
            <button className="w-5 h-5 bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] border border-white/30 rounded-sm flex items-center justify-center text-white text-[10px] hover:brightness-110">
              □
            </button>
            <button className="w-5 h-5 bg-gradient-to-b from-[#E81123] to-[#C42B1C] border border-white/30 rounded-sm flex items-center justify-center text-white text-[10px] font-bold hover:brightness-110">
              ✕
            </button>
          </div>
        </div>

        <div 
          className="bg-[#ECE9D8] border-b-2 border-white px-2 py-1 flex items-center gap-1"
          style={{
            boxShadow: 'inset 0 -1px 0 #ACA899, 0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          <NavButton 
            to="/perfil" 
            icon={<Icons.Profile className="w-4 h-4" />}
            label="Perfil"
            isActive={isActive('/perfil')}
          />
          <div className="w-px h-5 bg-gray-400 mx-1" />
          <NavButton 
            to="/chat" 
            icon={<Icons.Chat className="w-4 h-4" />}
            label="Conversas"
            isActive={isActive('/chat')}
          />
          <div className="w-px h-5 bg-gray-400 mx-1" />
          <NavButton 
            to="/grupos" 
            icon={<Icons.Groups className="w-4 h-4" />}
            label="Grupos"
            isActive={isActive('/grupos')}
          />
        </div>
      </header>

      <main ref={mainRef} className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {!isHeaderVisible && (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 transition-all
            bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] 
            border border-gray-500
            shadow-md hover:shadow-lg
            flex items-center gap-2"
          aria-label="Mostrar menu"
        >
          <Icons.Messenger className="w-4 h-4" />
          <span className="text-xs font-bold text-gray-700">Menu</span>
        </button>
      )}

      <div 
        className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-[#245EDC] via-[#3F8CF3] to-[#245EDC] border-t-2 border-[#5CACEE] z-20 flex items-center px-2"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <button 
          className="h-6 px-2 bg-gradient-to-b from-[#3C8E3C] to-[#2D6E2D] border border-[#2D5F2D] rounded-r-lg flex items-center gap-1 text-white text-xs font-bold shadow-md hover:brightness-110"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          <span className="text-[10px]">🪟</span>
          Iniciar
        </button>

        <div className="flex-1 flex items-center gap-1 ml-2">
          <div 
            className="h-6 px-2 bg-gradient-to-b from-[#3D6EDB] to-[#2950A8] border border-[#1E3F7A] flex items-center gap-1 text-white text-[10px] min-w-[120px]"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)'
            }}
          >
            <Icons.Messenger className="w-3 h-3" />
            <span className="truncate">Chat</span>
          </div>
        </div>

        <div 
          className="h-full px-3 bg-gradient-to-b from-[#0F8AEE] to-[#0C64C4] border-l border-[#0A5099] flex items-center gap-2 text-white text-[10px]"
          style={{
            boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.1)'
          }}
        >
          <span>🔊</span>
          <span>🛡️</span>
          <span className="font-bold">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

function NavButton({ 
  to, 
  icon, 
  label, 
  isActive 
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  isActive: boolean;
}) {
  return (
    <Link to={to}>
      <button 
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition-all
          ${isActive 
            ? 'bg-white border border-gray-400 shadow-inner text-[#003399]' 
            : 'bg-gradient-to-b from-[#FAFAFA] to-[#E0E0E0] border border-gray-400 text-gray-700 hover:from-white hover:to-[#F0F0F0] hover:border-[#0066CC] hover:text-[#0066CC]'
          }`}
        style={{
          boxShadow: isActive 
            ? 'inset 1px 1px 2px rgba(0,0,0,0.15)' 
            : '0 1px 0 rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        {icon}
        {label}
      </button>
    </Link>
  );
}