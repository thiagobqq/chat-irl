import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XPWindow, StatusDot } from "../../Shared/Components";
import { apiService } from "../../Shared/Services/api";
import type { Conversation, User } from "../../Shared/types/chat";
import { useAuth } from "../../Shared/Contexts";

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

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'conversations'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Conversas {conversations.length > 0 && `(${conversations.length})`}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Usuários {users.length > 0 && `(${users.length})`}
        </button>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'conversations' ? (
        <XPWindow title="Minhas Conversas">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Para ver suas mensagens faça login
              </h3>
              <p className="text-gray-500 mb-6">
                Entre na sua conta para acessar suas conversas!
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Fazer Login
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma conversa ainda
              </h3>
              <p className="text-gray-500 mb-6">
                Comece uma nova conversa com alguém!
              </p>
              <button
                onClick={() => setActiveTab('users')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ver usuários disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => handleConversationClick(conversation)}
                  className="relative bg-gradient-to-b from-white to-[#F0F4FF] border-2 border-[#5C93C9] hover:border-[#0066CC] rounded cursor-pointer group transition-all hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.2)]"
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Barra lateral colorida (estilo MSN) */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                      conversation.isOnline 
                        ? 'from-[#7FBA00] to-[#5E8C00]' 
                        : 'from-gray-400 to-gray-600'
                    }`}
                  ></div>

                  <div className="flex items-center gap-3 p-3 pl-4">
                    {/* Avatar com estilo MSN */}
                    <div className="relative flex-shrink-0">
                      <div 
                        className={`w-14 h-14 bg-gradient-to-br ${getGradient(conversation.username)} rounded border-2 border-white flex items-center justify-center text-white font-bold text-lg overflow-hidden`}
                        style={{
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
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
                      
                      {/* Ícone de status estilo MSN */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]"
                        style={{
                          background: conversation.isOnline 
                            ? 'linear-gradient(to bottom, #7FBA00, #5E8C00)' 
                            : 'linear-gradient(to bottom, #999999, #666666)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {conversation.isOnline ? '✓' : '—'}
                      </div>
                    </div>

                    {/* Info da conversa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#003399] text-sm truncate group-hover:text-[#0066CC]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                          {conversation.username}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span 
                            className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                            style={{
                              background: 'linear-gradient(to bottom, #FF6B6B, #CC0000)',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Última mensagem */}
                      <p className="text-xs text-gray-700 truncate mb-1" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        {conversation.lastMessage || 'Sem mensagens ainda...'}
                      </p>
                      
                      {/* Data/Hora */}
                      {conversation.lastMessageDate && (
                        <p className="text-[10px] text-gray-500" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                          {formatTime(conversation.lastMessageDate)}
                        </p>
                      )}
                    </div>

                    {/* Botões de ação estilo XP */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {/* Botão de mensagem */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConversationClick(conversation);
                        }}
                        className="w-8 h-8 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded flex items-center justify-center hover:from-[#E0F0FF] hover:to-[#C0DCFF] transition-all shadow-sm hover:shadow active:shadow-inner"
                        title="Abrir conversa"
                      >
                        <span className="text-sm">💬</span>
                      </button>
                      
                      {/* Botão de mais opções */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 bg-gradient-to-b from-white to-[#E0E8F0] border border-[#5C93C9] rounded flex items-center justify-center hover:from-[#F0F4FF] hover:to-[#D0DCF0] transition-all shadow-sm hover:shadow active:shadow-inner"
                        title="Mais opções"
                      >
                        <span className="text-xs font-bold text-[#003399]">⋯</span>
                      </button>
                    </div>
                  </div>

                  {/* Efeito de hover estilo XP */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </XPWindow>
      ) : (
        <XPWindow title="Todos os Usuários">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-500">
                Parece que não há outros usuários no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="relative bg-gradient-to-b from-white to-[#F0F4FF] border-2 border-[#5C93C9] hover:border-[#0066CC] rounded cursor-pointer group transition-all hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.2)]"
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Barra lateral colorida (estilo MSN) */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                      user.isOnline 
                        ? 'from-[#7FBA00] to-[#5E8C00]' 
                        : 'from-gray-400 to-gray-600'
                    }`}
                  ></div>

                  <div className="flex items-center gap-3 p-3 pl-4">
                    {/* Avatar com estilo MSN */}
                    <div className="relative flex-shrink-0">
                      <div 
                        className={`w-14 h-14 bg-gradient-to-br ${getGradient(user.userName)} rounded border-2 border-white flex items-center justify-center text-white font-bold text-lg overflow-hidden`}
                        style={{
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
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
                      
                      {/* Ícone de status estilo MSN */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]"
                        style={{
                          background: user.isOnline 
                            ? 'linear-gradient(to bottom, #7FBA00, #5E8C00)' 
                            : 'linear-gradient(to bottom, #999999, #666666)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {user.isOnline ? '✓' : '—'}
                      </div>
                    </div>

                    {/* Info do usuário */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#003399] text-sm truncate group-hover:text-[#0066CC]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        {user.userName}
                      </h3>
                      <p className="text-xs text-gray-600 truncate" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        {user.email}
                      </p>
                      
                      {/* Mensagem de status estilo MSN */}
                      <p className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                        {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                      </p>
                    </div>

                    {/* Botões de ação estilo XP */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {/* Botão de mensagem */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                        className="w-8 h-8 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded flex items-center justify-center hover:from-[#E0F0FF] hover:to-[#C0DCFF] transition-all shadow-sm hover:shadow active:shadow-inner"
                        title="Enviar mensagem"
                      >
                        <span className="text-sm">💬</span>
                      </button>
                      
                      {/* Botão de mais opções */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 bg-gradient-to-b from-white to-[#E0E8F0] border border-[#5C93C9] rounded flex items-center justify-center hover:from-[#F0F4FF] hover:to-[#D0DCF0] transition-all shadow-sm hover:shadow active:shadow-inner"
                        title="Mais opções"
                      >
                        <span className="text-xs font-bold text-[#003399]">⋯</span>
                      </button>
                    </div>
                  </div>

                  {/* Efeito de hover estilo XP */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </XPWindow>
      )}
    </div>
  );
}