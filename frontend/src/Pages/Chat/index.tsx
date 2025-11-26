import { useState, useEffect, useRef } from "react";
import { Send, Smile, User, MessageSquare, Settings, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { XPWindow } from "../../Shared/Components/XPWindow";
import { MessageBubble } from "../../Shared/Components/MessageBubble";
import { StatusIndicator } from "../../Shared/Components/StatusIndicator";
import { TypingBubble } from "../../Shared/Components/TypingBubble";
import { useAuth } from "../../Shared/Contexts";
import { apiService } from "../../Shared/Services/api";
import { signalRService } from "../../Shared/Services/signalr";
import { convertStatusToString } from "../../Shared/Utils/mappers";
import { useLocation } from "react-router-dom";
import type { Message } from "../../Shared/types/chat";

const RetroIcon = ({ src, fallback: Fallback, className, title }: { src: string; fallback: any; className?: string; title?: string }) => {
  const [error, setError] = useState(false);
  if (error) return <Fallback className={className} title={title} />;
  return (
    <img
      src={src}
      className={`${className} select-none`}
      title={title}
      style={{ imageRendering: "pixelated", display: "block" }}
      alt="icon"
      onError={() => setError(true)}
    />
  );
};

const ICON_BASE = "https://win98icons.alexmeub.com/icons/png";
const ICONS_URL = {
  SEND: `${ICON_BASE}/mail_send-0.png`,
  USER: `${ICON_BASE}/user-2.png`,
  USERS: `${ICON_BASE}/users-1.png`,
  MESSAGE: `${ICON_BASE}/envelope_closed-0.png`,
  SMILE: `${ICON_BASE}/smiley-0.png`,
  SETTINGS: `${ICON_BASE}/settings_gear-4.png`,
  SEARCH: `${ICON_BASE}/find-0.png`,
  REFRESH: `${ICON_BASE}/refresh-0.png`,
  CHAT: `${ICON_BASE}/message-0.png`,
};

const Icons = {
  Send: (props: any) => <RetroIcon src={ICONS_URL.SEND} fallback={Send} {...props} />,
  User: (props: any) => <RetroIcon src={ICONS_URL.USER} fallback={User} {...props} />,
  Users: (props: any) => <RetroIcon src={ICONS_URL.USERS} fallback={User} {...props} />,
  Message: (props: any) => <RetroIcon src={ICONS_URL.MESSAGE} fallback={MessageSquare} {...props} />,
  Smile: (props: any) => <RetroIcon src={ICONS_URL.SMILE} fallback={Smile} {...props} />,
  Settings: (props: any) => <RetroIcon src={ICONS_URL.SETTINGS} fallback={Settings} {...props} />,
  Search: (props: any) => <RetroIcon src={ICONS_URL.SEARCH} fallback={Search} {...props} />,
  Refresh: (props: any) => <RetroIcon src={ICONS_URL.REFRESH} fallback={RefreshCw} {...props} />,
  Chat: (props: any) => <RetroIcon src={ICONS_URL.CHAT} fallback={MessageSquare} {...props} />,
};

export function Chat() {
  const { user, isConnected } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const location = useLocation();

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRealStatus = (contact: any): "available" | "busy" | "away" | "offline" => {
    if (!contact.isOnline) return "offline";
    switch (contact.status) {
      case "Available": return "available";
      case "Busy": return "busy";
      case "Away": return "away";
      case "Offline": return "offline";
      default: return "available";
    }
  };

  const getStatusText = (contact: any) => {
    if (!contact.isOnline) return "Offline";
    switch (contact.status) {
      case "Available": return "Disponível";
      case "Busy": return "Ocupado";
      case "Away": return "Ausente";
      default: return "Disponível";
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === "") return "?";
    const words = name.trim().split(" ").filter(w => w.length > 0);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getGradient = (name?: string) => {
    if (!name || name.trim() === "") return "from-gray-400 to-gray-600";
    const gradients = [
      "from-purple-400 to-purple-600",
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-pink-400 to-pink-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
      "from-cyan-400 to-cyan-600",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const loadUsers = async () => {
    try {
      const users = await apiService.getUsers();
      const mappedContacts = users
        .filter((u: any) => u.id !== user?.id)
        .map((u: any) => ({
          id: u.id,
          name: u.userName,
          description: u.description || "",
          status: convertStatusToString(u.status),
          avatar: u.profilePicture,
          isOnline: u.isOnline, 
        }));
      setContacts(mappedContacts);
    } catch (error) {
      toast.error("Erro ao carregar contatos");
    }
  };

  const loadChatHistory = async (userId: string) => {
    try {
      const history = await apiService.getChatHistory(userId);
      setMessages(history);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact || !isConnected) return;

    try {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      await signalRService.stopTyping(selectedContact.id);
      await signalRService.sendMessageToUser(selectedContact.id, messageText);
      setMessageText("");
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (selectedContact && isConnected) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      signalRService.startTyping(selectedContact.id);
      typingTimerRef.current = window.setTimeout(() => {
        signalRService.stopTyping(selectedContact.id);
      }, 1500);
    }
  };

  useEffect(() => {
    if (!signalRService.isConnected()) return;

    const handleNewMessage = (message: Message) => {
      const isRelevant = selectedContact && (
        (String(message.senderId) === String(selectedContact.id) && String(message.receiverId) === String(user?.id)) ||
        (String(message.senderId) === String(user?.id) && String(message.receiverId) === String(selectedContact.id))
      );

      if (isRelevant) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    signalRService.updateCallbacks({
      onReceiveMessage: handleNewMessage,
      onMessageSent: handleNewMessage,
      onUserTyping: (userId: string) => {
        if (selectedContact && userId === selectedContact.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = window.setTimeout(() => setIsTyping(false), 3000);
          setTimeout(scrollToBottom, 100);
        }
      },
      onUserStoppedTyping: (userId: string) => {
        if (selectedContact && userId === selectedContact.id) {
          setIsTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      },
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedContact?.id, user?.id, isConnected]);

  useEffect(() => { if (user) loadUsers(); }, [user]);
  useEffect(() => { if (selectedContact) loadChatHistory(selectedContact.id); }, [selectedContact?.id]);
  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (selectedUserId && contacts.length > 0) {
      const contact = contacts.find((c: any) => c.id === selectedUserId);
      if (contact) setSelectedContact(contact);
    }
  }, [location.state, contacts]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-tahoma">
        <div className="text-center">
          <Icons.Message className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-28 pb-6 px-4 font-tahoma">
      <div className="container mx-auto h-full max-w-7xl">

        {!isConnected && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 text-center py-2 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
            <Icons.Refresh className="w-4 h-4 animate-spin" /> Conectando ao servidor...
          </div>
        )}

        <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-full">

          <div className="h-full overflow-hidden flex flex-col bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-b from-[#F6F9FC] to-[#EEF3FA] flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Icons.Users className="w-5 h-5" /> Contatos
                </h3>
                <button onClick={loadUsers} className="p-1 hover:bg-blue-100 rounded border border-transparent hover:border-blue-300 transition-all" title="Atualizar lista">
                  <Icons.Refresh className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar contato..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-400 shadow-inner focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icons.User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum contato encontrado</p>
                </div>
              ) : (
                filteredContacts.map((contact: any) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 p-2 rounded border transition-all text-left ${
                      selectedContact?.id === contact.id
                        ? "bg-[#FFF8DC] border-[#D2B48C] shadow-inner"
                        : "bg-transparent border-transparent hover:bg-white/60 hover:border-white/80"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getGradient(contact.name)} border-2 border-gray-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden`}>
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.textContent = getInitials(contact.name);
                            }}
                          />
                        ) : getInitials(contact.name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                        <StatusIndicator status={getRealStatus(contact)} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-blue-900 truncate">{contact.name}</div>
                      <div className="text-[10px] text-gray-600 truncate">
                        {contact.description || getStatusText(contact)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-200 bg-[#EEF3FA] flex-shrink-0">
              <p className="text-[10px] text-gray-500 text-center">
                {contacts.filter((c: any) => c.isOnline).length} de {contacts.length} online
              </p>
            </div>
          </div>

          <div className="h-full overflow-hidden">
            <XPWindow
              title={selectedContact ? `${selectedContact.name} - Conversa` : "Conversas"}
              icon={selectedContact ? <StatusIndicator status={getRealStatus(selectedContact)} /> : <Icons.Chat className="w-4 h-4" />}
            >
              {selectedContact ? (
                <div className="flex flex-col h-full bg-white">
                  <div ref={messagesContainerRef} className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ backgroundImage: "linear-gradient(to bottom, #ffffff, #f0faff)" }}>
                    {messages.length === 0 && !isTyping ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons.Message className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-gray-400 text-sm">Nenhuma mensagem ainda.</p>
                        <p className="text-gray-300 text-xs mt-1">Envie um "oi" para começar! 👋</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const isOwn = String(msg.senderId) === String(user?.id);
                          return (
                            <MessageBubble
                              key={msg.id}
                              content={msg.message}
                              isOwnMessage={isOwn}
                              senderName={isOwn ? "Você" : selectedContact.name}
                              timestamp={new Date(msg.sentAt)}
                              avatar={isOwn ? user?.avatar : selectedContact.avatar}
                            />
                          );
                        })}
                        {isTyping && <TypingBubble userName={selectedContact.name} avatar={selectedContact.avatar} />}
                      </>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 bg-[#EEF3FA] border-t border-[#8BA1C5] flex-shrink-0">
                    <div className="flex gap-2 items-start">
                      <textarea
                        value={messageText}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                        placeholder="Digite uma mensagem..."
                        disabled={!isConnected}
                        rows={2}
                        className="flex-1 px-3 py-2 border border-[#6884A8] rounded-sm focus:border-[#3465A4] focus:outline-none text-sm resize-none shadow-inner"
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
                  <div className="text-center">
                    <Icons.Chat className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-gray-500 text-sm font-bold mb-1">Selecione um contato</p>
                    <p className="text-gray-400 text-xs">Escolha alguém na lista para iniciar uma conversa</p>
                  </div>
                </div>
              )}
            </XPWindow>
          </div>
        </div>
      </div>
    </div>
  );
}