import { useState, useEffect, useRef } from "react";
import { 
  Send, Users, User, Plus, UserPlus, UserMinus, X, Settings, Shield, ShieldOff, RefreshCw 
} from "lucide-react"; // Importando Lucide para Fallback
import toast from 'react-hot-toast';
import { XPWindow } from "../../Shared/Components/XPWindow";
import { MessageBubble } from "../../Shared/Components/MessageBubble";
import { SystemMessage } from "../../Shared/Components/SystemMessage";
import { useAuth } from "../../Shared/Contexts";
import { apiService } from "../../Shared/Services/api";
import { signalRService } from "../../Shared/Services/signalr";
import type { Group, Message, User as UserType } from "../../Shared/types/chat"; 
import { TypingBubble } from "../../Shared/Components";

// --- SISTEMA DE ÍCONES HÍBRIDO (Retrô com Fallback) ---
const RetroIcon = ({ src, fallback: Fallback, className, title }: { src: string, fallback: any, className?: string, title?: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <Fallback className={className} title={title} />;
  }

  return (
    <img 
      src={src} 
      className={`${className} select-none`} 
      title={title} 
      style={{ imageRendering: 'pixelated', display: 'block' }} 
      alt="icon"
      onError={() => setError(true)}
    />
  );
};

// URLs corrigidas e verificadas
const ICON_BASE = "https://win98icons.alexmeub.com/icons/png";
const ICONS_URL = {
    SEND: `${ICON_BASE}/mail_send-0.png`,
    USERS: `${ICON_BASE}/users-1.png`, // Grupo
    USER: `${ICON_BASE}/user-2.png`, // Usuário
    PLUS: `${ICON_BASE}/directory_open-0.png`, // Pasta aberta (simboliza novo/abrir)
    USER_ADD: `${ICON_BASE}/user_computer-0.png`, // Adicionar usuário
    USER_DEL: `${ICON_BASE}/user_delete-0.png`, // Deletar usuário (se falhar, usa fallback)
    CLOSE: `${ICON_BASE}/msg_error-0.png`, // X Vermelho clássico
    SETTINGS: `${ICON_BASE}/settings_gear-4.png`, // Engrenagem
    KEY: `${ICON_BASE}/key-0.png`, // Chave (Admin)
    KEY_OFF: `${ICON_BASE}/access_control-1.png`, // Acesso restrito
    REFRESH: `${ICON_BASE}/recycle_bin_empty-4.png`
};

const Icons = {
  Send: (props: any) => <RetroIcon src={ICONS_URL.SEND} fallback={Send} {...props} />,
  Users: (props: any) => <RetroIcon src={ICONS_URL.USERS} fallback={Users} {...props} />,
  User: (props: any) => <RetroIcon src={ICONS_URL.USER} fallback={User} {...props} />,
  Plus: (props: any) => <RetroIcon src={ICONS_URL.PLUS} fallback={Plus} {...props} />,
  UserPlus: (props: any) => <RetroIcon src={ICONS_URL.USER_ADD} fallback={UserPlus} {...props} />, 
  UserMinus: (props: any) => <RetroIcon src={ICONS_URL.USER_DEL} fallback={UserMinus} {...props} />,
  X: (props: any) => <RetroIcon src={ICONS_URL.CLOSE} fallback={X} {...props} />, 
  Settings: (props: any) => <RetroIcon src={ICONS_URL.SETTINGS} fallback={Settings} {...props} />,
  Shield: (props: any) => <RetroIcon src={ICONS_URL.KEY} fallback={Shield} {...props} />,
  ShieldOff: (props: any) => <RetroIcon src={ICONS_URL.KEY_OFF} fallback={ShieldOff} {...props} />,
  Refresh: (props: any) => <RetroIcon src={ICONS_URL.REFRESH} fallback={RefreshCw} {...props} />,
};

interface ExtendedGroupMember {
    id: string;
    username: string;
    isAdmin: boolean;
    profilePicture?: string;
    description?: string;
}

export function GroupChat() {
  const { user, isConnected } = useAuth();
  
  // --- Estados Principais ---
  const [rooms, setRooms] = useState<Group[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // --- Estados de UI de Criação ---
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // --- Estados Compartilhados ---
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  // --- Estados de Configurações/Admin ---
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState<ExtendedGroupMember[]>([]);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // --- Estados de Chat ---
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const systemMessageCounterRef = useRef(0); 
  
  useEffect(() => {
    if (!isConnected) return;

    const handleGroupMessage = (message: Message) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        const messageGroupId = message.groupId ?? message.group?.id;
        if (selectedRoom && Number(messageGroupId) === Number(selectedRoom.id)) {
          return [...prev, message];
        }
        return prev;
      });
      setTimeout(scrollToBottom, 50);
    };

    const createSystemMessage = (type: 'join' | 'leave', userName: string): Message => {
      systemMessageCounterRef.current += 1;
      return {
        id: -systemMessageCounterRef.current, 
        senderId: 'system',
        receiverId: undefined,
        groupId: selectedRoom?.id,
        message: userName,
        sentAt: new Date().toISOString(),
        isRead: true,
        senderUsername: 'Sistema',
        isSystemMessage: true,
        systemMessageType: type
      };
    };

    signalRService.updateCallbacks({
      onReceiveGroupMessage: handleGroupMessage,
      onUserJoinedGroup: (userId: string, groupId: number) => {
        if (selectedRoom && Number(groupId) === Number(selectedRoom.id)) {
          if (showSettingsDialog) loadGroupMembers(groupId);
          const systemMsg = createSystemMessage('join', 'Um usuário entrou'); 
          setMessages(prev => [...prev, systemMsg]);
          setTimeout(scrollToBottom, 100);
        }
      },
      onUserLeftGroup: (userId: string, groupId: number) => {
        if (selectedRoom && Number(groupId) === Number(selectedRoom.id)) {
           if (showSettingsDialog) loadGroupMembers(groupId);
          const systemMsg = createSystemMessage('leave', 'Um usuário saiu');
          setMessages(prev => [...prev, systemMsg]);
          setTimeout(scrollToBottom, 100);
        }
      },
      onUserTyping: (userId: string) => {
        setTypingUsers(prev => new Set(prev).add(userId));
        setTimeout(() => setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        }), 3000);
        setTimeout(scrollToBottom, 100);
      },
      onUserStoppedTyping: (userId: string) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    });
  }, [isConnected, selectedRoom?.id, showSettingsDialog]);

  useEffect(() => {
    if (user) loadGroups();
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadGroupMessages(selectedRoom.id);
      signalRService.joinGroup(selectedRoom.id);
      setTypingUsers(new Set());
      loadGroupMembers(selectedRoom.id);
      return () => {
        signalRService.leaveGroup(selectedRoom.id);
      };
    } else {
      setMessages([]);
      setCurrentUserIsAdmin(false);
    }
  }, [selectedRoom?.id]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadGroups = async () => {
    try {
      const groups = await apiService.getMyGroups();
      setRooms(groups);
    } catch (error) {
      toast.error("Erro ao carregar grupos");
    }
  };

  const loadGroupMessages = async (groupId: number) => {
    try {
      const groupMessages = await apiService.getGroupMessages(groupId);
      const messagesWithGroupId = groupMessages.map(msg => ({
        ...msg,
        groupId: msg.groupId ?? groupId
      }));
      setMessages(messagesWithGroupId);
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      toast.error("Erro ao carregar mensagens");
    }
  };

  const loadGroupMembers = async (groupId: number) => {
    try {
      const members = await apiService.getGroupMembers(groupId); 
      setCurrentGroupMembers(members as ExtendedGroupMember[]);
      const me = members.find((m: any) => m.id === user?.id);
      setCurrentUserIsAdmin(!!me?.isAdmin);
    } catch (error) {
      console.error("Erro ao carregar membros", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom || !isConnected) return;
    try {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      await signalRService.stopTyping(selectedRoom.id.toString());
      await signalRService.sendMessageToGroup(selectedRoom.id, messageText);
      setMessageText("");
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (selectedRoom && isConnected) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      signalRService.startTyping(selectedRoom.id.toString());
      typingTimerRef.current = window.setTimeout(() => {
        signalRService.stopTyping(selectedRoom.id.toString());
      }, 1500);
    }
  };

  // --- ADMIN ACTIONS ---
  const handlePromote = async (memberId: string) => {
    if (!selectedRoom) return;
    const toastId = toast.loading("Promovendo usuário...");
    try {
      await apiService.promoteToAdmin(selectedRoom.id, memberId);
      toast.success("Usuário promovido!", { id: toastId });
      loadGroupMembers(selectedRoom.id); 
    } catch (error) {
      toast.error("Erro ao promover usuário", { id: toastId });
    }
  };

  const handleDemote = async (memberId: string) => {
    if (!selectedRoom) return;
    const toastId = toast.loading("Removendo permissão...");
    try {
      await apiService.demoteFromAdmin(selectedRoom.id, memberId);
      toast.success("Permissão removida!", { id: toastId });
      loadGroupMembers(selectedRoom.id);
    } catch (error) {
      toast.error("Erro ao remover permissão", { id: toastId });
    }
  };

  const handleKick = async (memberId: string) => {
    if (!selectedRoom) return;
    if (!confirm("Tem certeza que deseja remover este usuário do grupo?")) return;
    const toastId = toast.loading("Removendo usuário...");
    try {
      await apiService.removeMember(selectedRoom.id, memberId);
      toast.success("Usuário removido!", { id: toastId });
      loadGroupMembers(selectedRoom.id);
    } catch (error) {
      toast.error("Erro ao remover usuário", { id: toastId });
    }
  };

  // --- MODAIS ---
  const openCreateGroupModal = () => {
    setSelectedMembers([]);
    setShowCreateDialog(true);
    loadUsersForSelection(); 
  };

  const openAddMemberModal = async () => {
    if (!selectedRoom) return;
    setSelectedMembers([]);
    setShowAddMemberDialog(true);
    try {
        const allApiUsers = await apiService.getUsers();
        const existingMemberIds = new Set(currentGroupMembers.map(m => m.id));
        const availableUsers = allApiUsers.filter(u => !existingMemberIds.has(u.id));
        setAllUsers(availableUsers);
    } catch (error) {
        toast.error("Erro ao carregar usuários");
    }
  };

  const loadUsersForSelection = async () => {
    try {
      const users = await apiService.getUsers();
      setAllUsers(users.filter((u) => u.id !== user?.id));
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários");
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast.error("Digite um nome e selecione membros");
      return;
    }
    setIsCreating(true);
    const toastId = toast.loading("Criando grupo...");
    try {
      await apiService.createGroup(newGroupName, newGroupDescription, selectedMembers);
      await loadGroups();
      setShowCreateDialog(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setSelectedMembers([]);
      toast.success("Grupo criado!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar grupo", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddNewMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || selectedMembers.length === 0) return;
    setIsAddingMember(true);
    const toastId = toast.loading("Adicionando membros...");
    try {
        await Promise.all(selectedMembers.map(userId => 
            apiService.addMemberToGroup(selectedRoom.id, userId)
        ));
        toast.success("Membros adicionados!", { id: toastId });
        setShowAddMemberDialog(false);
        setSelectedMembers([]);
        loadGroupMembers(selectedRoom.id);
    } catch (error) {
        toast.error("Erro ao adicionar alguns membros", { id: toastId });
    } finally {
        setIsAddingMember(false);
    }
  };

  const openSettingsModal = () => {
    if (!selectedRoom) return;
    setShowSettingsDialog(true);
    setIsLoadingDetails(true);
    loadGroupMembers(selectedRoom.id).finally(() => setIsLoadingDetails(false));
  };

  if (!user) {
    return <div className="p-20 text-center text-gray-500 font-mono">Carregando...</div>;
  }

  return (
    <div className="fixed inset-0 pt-28 pb-6 px-4 font-sans">
      <div className="container mx-auto h-full max-w-7xl">
        {!isConnected && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 text-center py-2 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
            <Icons.Refresh className="w-4 h-4" /> Conectando ao servidor...
          </div>
        )}

        <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-full">
          
          {/* SIDEBAR - LISTA DE GRUPOS */}
          <div className="h-full overflow-hidden flex flex-col bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass p-3">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 px-1">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Icons.Users className="w-5 h-5" /> Meus Grupos
              </h3>
              <button
                onClick={openCreateGroupModal}
                className="p-1 hover:bg-blue-100 rounded border border-transparent hover:border-blue-300 transition-all"
                title="Novo Grupo"
              >
                <Icons.Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center gap-3 p-2 rounded border transition-all ${
                    selectedRoom?.id === room.id
                      ? "bg-[#FFF8DC] border-[#D2B48C] shadow-inner" // Estilo selecionado mais "quente/antigo"
                      : "bg-transparent border-transparent hover:bg-white/50 hover:border-white/60"
                  }`}
                >
                  {/* Ícone de Grupo do MSN */}
                  <div className="relative">
                     <Icons.Users className="w-8 h-8" />
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-xs text-blue-900 truncate font-tahoma">
                      {room.nome || room.name || "Sem Nome"}
                    </div>
                    <div className="text-[10px] text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"></span>
                      {room.members ? room.members.length : room.users?.length || 0} online
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* JANELA DE CHAT */}
          <div className="h-full overflow-hidden">
            <XPWindow
              title={selectedRoom ? (selectedRoom.nome || selectedRoom.name || "Conversa") : "Grupos"}
              icon={selectedRoom ? <Icons.Users className="w-4 h-4" /> : null}
            >
              {selectedRoom ? (
                <div className="flex flex-col h-full relative bg-white"> 
                  
                  {/* Botão de Settings Flutuante */}
                  <button 
                    onClick={openSettingsModal}
                    className="absolute top-2 right-4 z-20 p-1 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300 transition-all"
                    title="Opções do Grupo"
                  >
                    <Icons.Settings className="w-5 h-5" />
                  </button>

                  <div
                    ref={messagesContainerRef}
                    className="flex-1 p-4 space-y-2 overflow-y-auto bg-white"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0faff)' }} // Gradiente sutil MSN
                  >
                    {messages.map((msg) => {
                      if (msg.isSystemMessage && msg.systemMessageType) {
                        return (
                          <SystemMessage
                            key={msg.id}
                            type={msg.systemMessageType}
                            userName={msg.message}
                            timestamp={new Date(msg.sentAt)}
                          />
                        );
                      }
                      const isOwn = String(msg.senderId) === String(user?.id);
                      return (
                        <MessageBubble
                          key={msg.id}
                          content={msg.message}
                          isOwnMessage={isOwn}
                          senderName={isOwn ? "Você" : (msg.senderUsername || 'Anônimo')}
                          timestamp={new Date(msg.sentAt)}
                        />
                      );
                    })}
                    
                    {typingUsers.size > 0 && (
                       <div className="space-y-2 mt-2">
                        {Array.from(typingUsers).map(userId => {
                           const member = currentGroupMembers.find(u => u.id === userId);
                           return (
                            <TypingBubble 
                              key={userId} 
                              userName={member?.username || 'Alguém'} 
                              avatar={member?.profilePicture}
                            />
                           )
                        })}
                       </div>
                    )}
                  </div>

                  {/* Área de Input estilo MSN */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-[#EEF3FA] border-t border-[#8BA1C5] flex-shrink-0">
                    <div className="flex gap-2 items-start">
                      <textarea
                        value={messageText}
                        onChange={(e) => { setMessageText(e.target.value); handleInputChange(e as any); }}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                        placeholder="Digite uma mensagem..."
                        disabled={!isConnected}
                        rows={2}
                        className="flex-1 px-3 py-2 border border-[#6884A8] rounded-sm focus:border-[#3465A4] focus:outline-none text-sm resize-none font-tahoma shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || !isConnected}
                        className="h-14 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-[#FCFCFC] to-[#DEE9F7] border border-[#8BA1C5] rounded hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:grayscale"
                      >
                        <Icons.Send className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold text-[#333]">Enviar</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-b from-white to-[#EEF3FA]">
                  <div className="text-center opacity-60">
                    <Icons.Users className="w-16 h-16 mx-auto mb-2 grayscale" />
                    <p className="text-gray-500 font-tahoma text-sm">Para iniciar, selecione um grupo na lista.</p>
                  </div>
                </div>
              )}
            </XPWindow>
          </div>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO DE GRUPO */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 font-tahoma shadow-text">
                <Icons.Plus className="w-4 h-4" /> Criar Novo Grupo
              </span>
              <button onClick={() => setShowCreateDialog(false)} className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600">
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-4 space-y-4 overflow-y-auto font-tahoma text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Nome do Grupo:</label>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-500 shadow-inner"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">Descrição:</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-500 shadow-inner resize-none"
                />
              </div>
              <div className="border border-gray-400 bg-white p-2 h-40 overflow-y-auto shadow-inner">
                <p className="font-bold mb-2 bg-gray-200 px-1">Selecionar contatos:</p>
                {allUsers.map(usr => (
                    <label key={usr.id} className="flex items-center gap-2 p-1 hover:bg-[#316AC5] hover:text-white cursor-pointer">
                        <input type="checkbox" checked={selectedMembers.includes(usr.id)} onChange={() => toggleMember(usr.id)} />
                        <Icons.User className="w-4 h-4" />
                        <span>{usr.userName}</span>
                    </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateDialog(false)} className="px-4 py-1 border border-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm rounded-sm">Cancelar</button>
                <button type="submit" disabled={isCreating} className="px-4 py-1 border border-[#003C74] bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] text-black font-bold hover:bg-white shadow-sm rounded-sm">
                    {isCreating ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR MEMBROS */}
      {showAddMemberDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 font-tahoma shadow-text">
                <Icons.UserPlus className="w-4 h-4" /> Convidar Pessoa
              </span>
              <button onClick={() => setShowAddMemberDialog(false)} className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600">
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
            <form onSubmit={handleAddNewMembers} className="p-4 space-y-4 flex-1 font-tahoma text-xs">
              <p>Selecione quem você quer adicionar à conversa:</p>
              
              <div className="border border-gray-400 bg-white h-60 overflow-y-auto shadow-inner p-1">
                  {allUsers.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">Ninguém disponível.</div>
                  ) : (
                    allUsers.map(usr => (
                        <label key={usr.id} className="flex items-center gap-2 p-1 hover:bg-[#316AC5] hover:text-white cursor-pointer">
                            <input type="checkbox" checked={selectedMembers.includes(usr.id)} onChange={() => toggleMember(usr.id)} />
                            <Icons.User className="w-4 h-4" />
                            <span>{usr.userName}</span>
                        </label>
                    ))
                  )}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddMemberDialog(false)} className="px-4 py-1 border border-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm rounded-sm">Cancelar</button>
                <button type="submit" disabled={isAddingMember || selectedMembers.length === 0} className="px-4 py-1 border border-[#003C74] bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] text-black font-bold hover:bg-white shadow-sm rounded-sm">
                    OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES (CONFIGURAÇÕES) */}
      {showSettingsDialog && selectedRoom && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 font-tahoma shadow-text">
                <Icons.Settings className="w-4 h-4" /> Propriedades do Grupo
              </span>
              <button onClick={() => setShowSettingsDialog(false)} className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600">
                <Icons.X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-tahoma text-xs">
              <div className="flex items-start gap-4 mb-4 border-b border-gray-300 pb-4">
                 <div className="w-16 h-16 bg-white border border-gray-400 shadow-inner flex items-center justify-center">
                     <Icons.Users className="w-10 h-10" />
                 </div>
                 <div>
                     <h2 className="text-base font-bold text-gray-800">{selectedRoom.nome || selectedRoom.name}</h2>
                     <p className="text-gray-600">{selectedRoom.descricao || selectedRoom.description || "Sem descrição definida."}</p>
                     {selectedRoom.dataCriacao && (
                        <p className="text-[10px] text-gray-400 mt-1">Criado em: {new Date(selectedRoom.dataCriacao).toLocaleDateString()}</p>
                     )}
                 </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-1">
                    <Icons.Users className="w-4 h-4" /> Participantes ({currentGroupMembers.length})
                </h3>
                {currentUserIsAdmin && (
                    <button 
                        onClick={openAddMemberModal}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-400 hover:bg-blue-50 rounded-sm shadow-sm"
                    >
                        <Icons.UserPlus className="w-3 h-3" /> <span className="text-[10px]">Convidar</span>
                    </button>
                )}
              </div>

              {isLoadingDetails ? (
                <div className="text-center py-4 text-gray-500">Lendo dados...</div>
              ) : (
                <div className="border border-gray-400 bg-white h-64 overflow-y-auto shadow-inner p-1">
                  {currentGroupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-1 hover:bg-[#E1EAF3] border-b border-dotted border-gray-200 last:border-0">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center bg-gray-100`}>
                            {/* Foto ou Ícone padrão */}
                             <Icons.User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1">
                                <span className={`font-bold truncate ${member.isAdmin ? 'text-red-700' : 'text-gray-800'}`}>
                                    {member.username} {member.id === user.id && "(Você)"}
                                </span>
                                {member.isAdmin && (
                                    <Icons.Shield className="w-3 h-3" title="Administrador" />
                                )}
                            </div>
                        </div>
                      </div>

                      {currentUserIsAdmin && member.id !== user.id && (
                        <div className="flex items-center gap-1">
                            {member.isAdmin ? (
                                <button 
                                    onClick={() => handleDemote(member.id)}
                                    className="p-1 hover:bg-white border border-transparent hover:border-gray-400 rounded-sm"
                                    title="Remover Admin"
                                >
                                    <Icons.ShieldOff className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handlePromote(member.id)}
                                    className="p-1 hover:bg-white border border-transparent hover:border-gray-400 rounded-sm"
                                    title="Tornar Admin"
                                >
                                    <Icons.Shield className="w-4 h-4" />
                                </button>
                            )}
                            
                            <button 
                                onClick={() => handleKick(member.id)}
                                className="p-1 hover:bg-white border border-transparent hover:border-gray-400 rounded-sm"
                                title="Remover do grupo"
                            >
                                <Icons.UserMinus className="w-4 h-4" />
                            </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-2 bg-[#ECE9D8] border-t border-white flex justify-between items-center">
                {currentUserIsAdmin && (
                    <span className="text-[10px] text-gray-500">Modo Administrador</span>
                )}
                <button 
                    onClick={() => setShowSettingsDialog(false)}
                    className="ml-auto px-4 py-1 border border-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm rounded-sm text-xs"
                >
                    Fechar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}