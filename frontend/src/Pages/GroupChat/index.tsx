import { useState, useEffect, useRef } from "react";
import { Send, Users, Plus, UserPlus, X } from "lucide-react";
import { XPWindow } from "../../Shared/Components/XPWindow";
import { MessageBubble } from "../../Shared/Components/MessageBubble";
import { useAuth } from "../../Shared/Contexts";
import { apiService } from "../../Shared/Services/api";
import { signalRService } from "../../Shared/Services/signalr";
import type { Message, Group, User } from "../../Shared/types/chat";

export function GroupChat() {
  const { user, isConnected } = useAuth();
  const [rooms, setRooms] = useState<Group[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar grupos
  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  // Carregar mensagens quando selecionar grupo
  useEffect(() => {
    if (selectedRoom) {
      loadGroupMessages(selectedRoom.id);
      signalRService.joinGroup(selectedRoom.id);
      
      return () => {
        signalRService.leaveGroup(selectedRoom.id);
      };
    } else {
      setMessages([]);
    }
  }, [selectedRoom?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Polling de mensagens de grupo
  useEffect(() => {
    if (!selectedRoom || !isConnected) return;

    const interval = setInterval(() => {
      loadGroupMessages(selectedRoom.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedRoom?.id, isConnected]);

  const loadGroups = async () => {
    try {
      const groups = await apiService.getMyGroups();
      console.log('📁 Grupos carregados:', groups);
      setRooms(groups);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    }
  };

  const loadGroupMessages = async (groupId: number) => {
    try {
      console.log('📜 Carregando mensagens do grupo:', groupId);
      const groupMessages = await apiService.getGroupMessages(groupId);
      console.log('📨 Mensagens do grupo recebidas:', groupMessages);
      
      // Garantir que todas as mensagens tenham groupId
      const messagesWithGroupId = groupMessages.map(msg => ({
        ...msg,
        groupId: msg.groupId ?? groupId
      }));
      
      setMessages(messagesWithGroupId);
    } catch (error) {
      console.error("Erro ao carregar mensagens do grupo:", error);
    }
  };

  const loadUsersForSelection = async () => {
    try {
      const users = await apiService.getUsers();
      setAllUsers(users.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const openCreateGroupModal = () => {
    setShowCreateDialog(true);
    loadUsersForSelection();
  };

  const closeCreateGroupModal = () => {
    setShowCreateDialog(false);
    setNewGroupName("");
    setNewGroupDescription("");
    setSelectedMembers([]);
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      alert("Digite um nome e selecione pelo menos um membro");
      return;
    }

    setIsCreating(true);

    try {
      await apiService.createGroup(newGroupName, newGroupDescription, selectedMembers);
      await loadGroups();
      closeCreateGroupModal();
      alert("✅ Grupo criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar grupo:", error);
      alert(error.message || "Erro ao criar grupo");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom || !isConnected) return;

    try {
      console.log('📤 Enviando mensagem ao grupo:', {
        groupId: selectedRoom.id,
        message: messageText
      });
      
      await signalRService.sendMessageToGroup(selectedRoom.id, messageText);
      setMessageText("");
      
      // Recarregar mensagens após enviar
      setTimeout(() => {
        loadGroupMessages(selectedRoom.id);
      }, 500);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5EAEFF] via-[#B7E3FF] to-white">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#5EAEFF] via-[#B7E3FF] to-white relative font-segoe flex flex-col overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
        </div>
      </div>

      {/* Status de conexão */}
      {!isConnected && (
        <div className="relative z-20 bg-yellow-500 text-white text-center py-2 text-sm font-semibold flex-shrink-0">
          ⚠️ Reconectando ao servidor...
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto px-4 py-6 max-w-7xl flex-1 flex flex-col overflow-hidden">
          <div className="grid lg:grid-cols-[320px_1fr] gap-4 flex-1 overflow-hidden">
            {/* Lista de Grupos */}
            <div className="flex flex-col overflow-hidden bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass p-3">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-bold text-blue-800">Grupos</h3>
                <button
                  onClick={openCreateGroupModal}
                  className="p-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 flex-1 overflow-y-auto">
                {rooms.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Nenhum grupo ainda.<br />
                    Crie um novo grupo!
                  </div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedRoom?.id === room.id
                          ? "bg-blue-100 border-2 border-blue-400 shadow-md"
                          : "bg-white hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {room.nome || room.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {room.users?.length || 0} membros
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Área de Chat */}
            <div className="flex flex-col overflow-hidden">
              <XPWindow
                title={
                  selectedRoom
                    ? selectedRoom.nome || selectedRoom.name
                    : "Selecione um grupo"
                }
                icon={selectedRoom ? <Users className="w-4 h-4 text-white" /> : null}
              >
                {selectedRoom ? (
                  <div className="flex flex-col h-full">
                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-[#F0FFF4] to-white">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400 text-center">
                            Nenhuma mensagem ainda.<br />
                            Seja o primeiro a enviar uma mensagem!
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                           const isOwn = String(msg.senderId) === String(user?.id);
                          
                          console.log('🎨 Renderizando:', {
                            msgId: msg.id,
                            senderId: String(msg.senderId),
                            currentUserId: String(user?.id),
                            isOwn,
                            senderName: msg.senderUsername
                          });
                          
                          return (
                            <MessageBubble
                              key={msg.id}
                              content={msg.message}
                              isOwnMessage={isOwn}
                              senderName={isOwn ? "Você" : msg.senderUsername}
                              timestamp={new Date(msg.sentAt)}
                            />
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input de mensagem */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
                    >
                      <div className="flex gap-2">
                        <input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          disabled={!isConnected}
                          className="flex-1 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                          type="submit"
                          disabled={!messageText.trim() || !isConnected}
                          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                          Enviar
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-b from-[#F0FFF4] to-white">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-green-500" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        Selecione um grupo ou crie um novo
                      </p>
                    </div>
                  </div>
                )}
              </XPWindow>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Criar Grupo */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 rounded-t-lg shadow-xp-window overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Title bar */}
            <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-3 py-2 border-b border-[#003C8C] flex items-center justify-between flex-shrink-0">
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Criar Novo Grupo
              </span>
              <button
                onClick={closeCreateGroupModal}
                className="text-white hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Digite o nome do grupo"
                  className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Descrição do grupo"
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Adicionar membros:
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {allUsers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Nenhum usuário disponível
                    </p>
                  ) : (
                    allUsers.map((usr) => (
                      <label
                        key={usr.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(usr.id)}
                          onChange={() => toggleMember(usr.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {usr.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {usr.userName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {usr.email}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeCreateGroupModal}
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] hover:shadow-xp-button-hover active:from-[#D0D0D0] active:to-white active:shadow-xp-button-active transition-all duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#003C8C] border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Criar Grupo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}