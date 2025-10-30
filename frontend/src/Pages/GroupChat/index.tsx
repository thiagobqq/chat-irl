import { useState, useEffect, useRef } from "react";
import { Send, Users, Plus, UserPlus, X } from "lucide-react";
import toast from 'react-hot-toast';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Handlers em tempo real (mensagens de grupo, join/leave)
  useEffect(() => {
    if (!isConnected) return;

    const handleGroupMessage = (message: Message) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        if (selectedRoom && Number(message.groupId) === Number(selectedRoom.id)) {
          return [...prev, message];
        }
        return prev;
      });
      setTimeout(scrollToBottom, 50);
    };

    signalRService.updateCallbacks({
      onReceiveGroupMessage: handleGroupMessage,
      onUserJoinedGroup: (userId: string, groupId: number) => {
        if (selectedRoom && Number(groupId) === Number(selectedRoom.id)) {
          console.log(`👤 ${userId} entrou no grupo ${groupId}`);
        }
      },
      onUserLeftGroup: (userId: string, groupId: number) => {
        if (selectedRoom && Number(groupId) === Number(selectedRoom.id)) {
          console.log(`👤 ${userId} saiu do grupo ${groupId}`);
        }
      }
    });
  }, [isConnected, selectedRoom?.id]);

  // Carregar grupos
  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  // Carregar mensagens e entrar/sair do grupo quando selecionar
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
      toast.error("Erro ao carregar mensagens do grupo");
    }
  };

  const loadUsersForSelection = async () => {
    try {
      const users = await apiService.getUsers();
      setAllUsers(users.filter((u) => u.id !== user?.id));
    } catch (error) {
      toast.error("Erro ao carregar usuários");
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
      toast.error("Digite um nome e selecione pelo menos um membro");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Criando grupo...");

    try {
      await apiService.createGroup(newGroupName, newGroupDescription, selectedMembers);
      await loadGroups();
      closeCreateGroupModal();
      toast.success("Grupo criado com sucesso!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar grupo", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom || !isConnected) return;

    try {
      await signalRService.sendMessageToGroup(selectedRoom.id, messageText);
      setMessageText("");
      // Sem reload — a mensagem chega pelo onReceiveGroupMessage
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-28 pb-6 px-4">
      <div className="container mx-auto h-full max-w-7xl">
        {!isConnected && (
          <div className="mb-4 bg-yellow-500 text-white text-center py-2 rounded-lg text-sm font-semibold">
            ⚠️ Reconectando ao servidor...
          </div>
        )}

        <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-full">
          {/* Lista de Grupos */}
          <div className="h-full overflow-hidden flex flex-col bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass p-3">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-sm font-bold text-blue-800">Grupos</h3>
              <button
                onClick={openCreateGroupModal}
                className="p-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
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
          <div className="h-full overflow-hidden">
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
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 p-6 space-y-3 overflow-y-auto bg-gradient-to-b from-[#F0FFF4] to-white"
                  >
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
                  </div>

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
                        className="flex-1 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors disabled:bg-gray-100"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || !isConnected}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all disabled:opacity-50"
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
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all disabled:opacity-50"
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