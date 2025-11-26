import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XPWindow } from "../../Shared/Components";
import { apiService } from "../../Shared/Services/api";
import type { Conversation, User } from "../../Shared/types/chat";
import { useAuth } from "../../Shared/Contexts";
import { 
  MessageSquare, 
  Users, 
  Mail, 
  MoreHorizontal, 
  LogIn,
  UserPlus,
  Loader2
} from "lucide-react";

// Componente de ícone retrô (igual ao EditProfile)
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

// URLs dos ícones Win98
const ICONS_URL = {
  CONVERSATIONS: "https://win98icons.alexmeub.com/icons/png/mail_file-0.png",
  USERS: "https://win98icons.alexmeub.com/icons/png/users-0.png",
  MESSAGE: "https://win98icons.alexmeub.com/icons/png/write_wordpad-0.png",
  MORE: "https://win98icons.alexmeub.com/icons/png/settings_gear-0.png",
  LOGIN: "https://win98icons.alexmeub.com/icons/png/key_win-2.png",
  USER: "https://win98icons.alexmeub.com/icons/png/user-2.png",
  ONLINE: "https://win98icons.alexmeub.com/icons/png/connected-0.png",
  OFFLINE: "https://win98icons.alexmeub.com/icons/png/disconnected-0.png",
  COMPUTER: "https://win98icons.alexmeub.com/icons/png/computer_explorer-5.png",
  FOLDER: "https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png",
};

// Ícones estilizados
const Icons = {
  Conversations: (props: any) => <RetroIcon src={ICONS_URL.CONVERSATIONS} fallback={Mail} {...props} />,
  Users: (props: any) => <RetroIcon src={ICONS_URL.USERS} fallback={Users} {...props} />,
  Message: (props: any) => <RetroIcon src={ICONS_URL.MESSAGE} fallback={MessageSquare} {...props} />,
  More: (props: any) => <RetroIcon src={ICONS_URL.MORE} fallback={MoreHorizontal} {...props} />,
  Login: (props: any) => <RetroIcon src={ICONS_URL.LOGIN} fallback={LogIn} {...props} />,
  User: (props: any) => <RetroIcon src={ICONS_URL.USER} fallback={UserPlus} {...props} />,
  Online: (props: any) => <RetroIcon src={ICONS_URL.ONLINE} fallback={() => <span>🟢</span>} {...props} />,
  Offline: (props: any) => <RetroIcon src={ICONS_URL.OFFLINE} fallback={() => <span>⚫</span>} {...props} />,
  Computer: (props: any) => <RetroIcon src={ICONS_URL.COMPUTER} fallback={Loader2} {...props} />,
  Folder: (props: any) => <RetroIcon src={ICONS_URL.FOLDER} fallback={Users} {...props} />,
};

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conversationsData, usersData, currentUserData] = await Promise.all([
        apiService.getConversations(),
        apiService.getUsers(),
        apiService.getCurrentUser(),
      ]);
      
      setConversations(conversationsData);
      setCurrentUser(currentUserData);
      setUsers(usersData.filter(u => u.id !== currentUserData.id));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    navigate('/chat', { 
      state: { selectedUserId: conversation.userId } 
    });
  };

  const handleUserClick = (user: User) => {
    navigate('/chat', { 
      state: { selectedUserId: user.id } 
    });
  };

  const formatTime = (date?: Date | string | null) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      const now = new Date();
      const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } else {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
    } catch {
      return '';
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return '?';
    const words = name.trim().split(' ').filter(w => w.length > 0);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getGradient = (name?: string) => {
    if (!name || name.trim() === '') return 'from-gray-400 to-gray-600';
    
    const gradients = [
      'from-purple-400 to-purple-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600',
      'from-teal-400 to-teal-600',
    ];
    
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Loading state estilo XP
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-tahoma">
        <div className="text-center">
          <Icons.Computer className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-24 pb-32 px-4 font-tahoma">
      <div className="max-w-2xl mx-auto">
        
        <XPWindow 
          title={activeTab === 'conversations' ? "Minhas Conversas" : "Todos os Usuários"}
          icon={activeTab === 'conversations' ? <Icons.Conversations className="w-4 h-4" /> : <Icons.Users className="w-4 h-4" />}
        >
          <div className="bg-[#ECE9D8]">
            {/* Tabs dentro do XPWindow */}
            <div className="px-3 pt-3">
              <div className="flex gap-0 border-b border-gray-400">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold border border-b-0 transition-all ${
                    activeTab === 'conversations'
                      ? 'bg-white border-gray-400 border-b-white text-black -mb-px z-10'
                      : 'bg-[#D4D0C8] border-gray-400 text-gray-600 hover:bg-[#E0DCD0]'
                  }`}
                >
                  <Icons.Conversations className="w-4 h-4" />
                  Conversas {conversations.length > 0 && `(${conversations.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold border border-b-0 border-l-0 transition-all ${
                    activeTab === 'users'
                      ? 'bg-white border-gray-400 border-b-white text-black -mb-px z-10'
                      : 'bg-[#D4D0C8] border-gray-400 text-gray-600 hover:bg-[#E0DCD0]'
                  }`}
                >
                  <Icons.Users className="w-4 h-4" />
                  Usuários {users.length > 0 && `(${users.length})`}
                </button>
              </div>
            </div>

            {/* Conteúdo das tabs */}
            <div className="p-3">
              {activeTab === 'conversations' ? (
                <>
                  {!isAuthenticated ? (
                    <div className="text-center py-8 bg-white border border-gray-400 shadow-inner">
                      <Icons.Login className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Para ver suas mensagens faça login
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Entre na sua conta para acessar suas conversas!
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] border border-[#003C74] text-black font-bold text-xs hover:bg-white shadow-sm"
                      >
                        <Icons.Login className="w-4 h-4" /> Fazer Login
                      </button>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-gray-400 shadow-inner">
                      <Icons.Folder className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Nenhuma conversa ainda
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Comece uma nova conversa com alguém!
                      </p>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] border border-[#003C74] text-black font-bold text-xs hover:bg-white shadow-sm"
                      >
                        <Icons.Users className="w-4 h-4" /> Ver usuários
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 bg-white border border-gray-400 shadow-inner p-2">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.userId}
                          onClick={() => handleConversationClick(conversation)}
                          className="flex items-center gap-3 p-2 bg-[#F5F5F5] border border-gray-300 hover:bg-[#E8F4FF] hover:border-[#0066CC] cursor-pointer transition-all group"
                        >
                          {/* Avatar quadrado estilo XP */}
                          <div className="relative flex-shrink-0">
                            <div 
                              className={`w-10 h-10 bg-gradient-to-br ${getGradient(conversation.username)} border-2 border-gray-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden`}
                            >
                              {conversation.profilePicture ? (
                                <img 
                                  src={conversation.profilePicture} 
                                  alt={conversation.username}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.textContent = getInitials(conversation.username);
                                  }}
                                />
                              ) : (
                                getInitials(conversation.username)
                              )}
                            </div>
                            
                            {/* Status indicator */}
                            <div className="absolute -bottom-1 -right-1">
                              {conversation.isOnline ? (
                                <Icons.Online className="w-4 h-4" />
                              ) : (
                                <Icons.Offline className="w-4 h-4" />
                              )}
                            </div>
                          </div>

                          {/* Info da conversa */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-[#003399] text-xs truncate group-hover:text-[#0066CC]">
                                {conversation.username}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 border border-red-800">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-gray-600 truncate">
                              {conversation.lastMessage || 'Sem mensagens ainda...'}
                            </p>
                            
                            {conversation.lastMessageDate && (
                              <p className="text-[9px] text-gray-400">
                                {formatTime(conversation.lastMessageDate)}
                              </p>
                            )}
                          </div>

                          {/* Botões de ação estilo XP */}
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConversationClick(conversation);
                              }}
                              className="w-7 h-7 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-500 flex items-center justify-center hover:bg-gray-100 active:shadow-inner"
                              title="Abrir conversa"
                            >
                              <Icons.Message className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-7 h-7 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-500 flex items-center justify-center hover:bg-gray-100 active:shadow-inner"
                              title="Mais opções"
                            >
                              <Icons.More className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {users.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-gray-400 shadow-inner">
                      <Icons.User className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Nenhum usuário encontrado
                      </h3>
                      <p className="text-xs text-gray-500">
                        Parece que não há outros usuários no momento.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 bg-white border border-gray-400 shadow-inner p-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserClick(user)}
                          className="flex items-center gap-3 p-2 bg-[#F5F5F5] border border-gray-300 hover:bg-[#E8F4FF] hover:border-[#0066CC] cursor-pointer transition-all group"
                        >
                          {/* Avatar quadrado estilo XP */}
                          <div className="relative flex-shrink-0">
                            <div 
                              className={`w-10 h-10 bg-gradient-to-br ${getGradient(user.userName)} border-2 border-gray-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden`}
                            >
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  alt={user.userName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.textContent = getInitials(user.userName);
                                  }}
                                />
                              ) : (
                                getInitials(user.userName)
                              )}
                            </div>
                            
                            {/* Status indicator */}
                            <div className="absolute -bottom-1 -right-1">
                              {user.isOnline ? (
                                <Icons.Online className="w-4 h-4" />
                              ) : (
                                <Icons.Offline className="w-4 h-4" />
                              )}
                            </div>
                          </div>

                          {/* Info do usuário */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#003399] text-xs truncate group-hover:text-[#0066CC]">
                              {user.userName}
                            </h3>
                            <p className="text-[10px] text-gray-600 truncate">
                              {user.description || 'Sem descrição'}
                            </p>
                            <p className="text-[9px] text-gray-400 flex items-center gap-1">
                              {user.isOnline ? (
                                <>
                                  <span className="w-2 h-2 bg-green-500 border border-green-700"></span>
                                  Online
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-gray-400 border border-gray-600"></span>
                                  Offline
                                </>
                              )}
                            </p>
                          </div>

                          {/* Botões de ação estilo XP */}
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user);
                              }}
                              className="w-7 h-7 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-500 flex items-center justify-center hover:bg-gray-100 active:shadow-inner"
                              title="Enviar mensagem"
                            >
                              <Icons.Message className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-7 h-7 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-500 flex items-center justify-center hover:bg-gray-100 active:shadow-inner"
                              title="Mais opções"
                            >
                              <Icons.More className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </XPWindow>
      </div>
    </div>
  );
}