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
        apiService.getAllUsers(),
        apiService.getCurrentUser(),
      ]);
      
      console.log('📊 Conversações:', conversationsData);
      console.log('👥 Usuários:', usersData);
      console.log('👤 Usuário atual:', currentUserData);
      
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
    navigate(`/chat/${conversation.userId}`);
  };

  const handleUserClick = (user: User) => {
    navigate(`/chat/${user.id}`);
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
          💬 Conversas {conversations.length > 0 && `(${conversations.length})`}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          👥 Usuários {users.length > 0 && `(${users.length})`}
        </button>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'conversations' ? (
        <XPWindow title="📫 Minhas Conversas">
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
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => handleConversationClick(conversation)}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${getGradient(conversation.username)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform`}>
                      {getInitials(conversation.username)}
                    </div>
                    {/* Status online/offline */}
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Info da conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {conversation.username}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || 'Sem mensagens ainda...'}
                    </p>
                  </div>
                  
                  {/* Horário */}
                  <div className="flex flex-col items-end gap-2">
                    {conversation.lastMessageDate && (
                      <span className="text-xs text-gray-500 font-medium">
                        {formatTime(conversation.lastMessageDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </XPWindow>
      ) : (
        <XPWindow title="👥 Todos os Usuários">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${getGradient(user.userName)} rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform`}>
                    {getInitials(user.userName)}
                  </div>
                  
                  {/* Info do usuário */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {user.userName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <StatusDot status={user.isOnline ? 'available' : 'offline'} />
                </div>
              ))}
            </div>
          )}
        </XPWindow>
      )}
    </div>
  );
}