import { useState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { XPWindow } from "../../Shared/Components/XPWindow";
import { ContactList } from "../../Shared/Components/ContactList";
import { MessageBubble } from "../../Shared/Components/MessageBubble";
import { StatusIndicator } from "../../Shared/Components/StatusIndicator";
import { useAuth } from "../../Shared/Contexts";
import { apiService } from "../../Shared/Services/api";
import { signalRService } from "../../Shared/Services/signalr";
import { convertStatusToString } from "../../Shared/Utils/mappers";
import { useLocation } from "react-router-dom"; 
import type { Contact, Message } from "../../Shared/types/chat";

export function Chat() {
  const { user, isConnected } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
   const location = useLocation(); 

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadChatHistory(selectedContact.id);
    } else {
      setMessages([]);
    }
  }, [selectedContact?.id]);

   useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (selectedUserId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === selectedUserId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [location.state, contacts]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const statusToLowercase = (status: string) => {
    return status.toLowerCase() as "available" | "busy" | "away" | "offline";
  };

  const loadUsers = async () => {
  try {
    const users = await apiService.getUsers();
    
    const mappedContacts: Contact[] = users
      .filter((u) => u.id !== user?.id)
      .map((u) => {
        
        return {
          id: u.id,
          name: u.userName,
          description: u.description || "",
          status: convertStatusToString(u.status),
          avatar: u.profilePicture,
        };
      });
    
    setContacts(mappedContacts);
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    toast.error("Erro ao carregar usuários");
  }
};

  const loadChatHistory = async (userId: string) => {
    try {
      const history = await apiService.getChatHistory(userId);
      setMessages(history);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico de mensagens");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact || !isConnected) return;

    try {
      await signalRService.sendMessageToUser(selectedContact.id, messageText);
      setMessageText("");
      
      setTimeout(() => {
        loadChatHistory(selectedContact.id);
      }, 300);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (selectedContact && isConnected) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      signalRService.startTyping(selectedContact.id);

      typingTimerRef.current = window.setTimeout(() => {
        signalRService.stopTyping(selectedContact.id);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(e as any);
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
          <div className="h-full overflow-hidden">
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </div>

          <div className="h-full overflow-hidden">
            <XPWindow
              title={
                selectedContact
                  ? `Conversa com ${selectedContact.name}`
                  : "Selecione um contato"
              }
              icon={
                selectedContact ? (
                  <StatusIndicator status={statusToLowercase(selectedContact.status)} />
                ) : null
              }
            >
              {selectedContact ? (
                <div className="flex flex-col h-full">
                  {isTyping && (
                    <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                      <p className="text-blue-600 text-sm">
                        {selectedContact.name} está digitando...
                      </p>
                    </div>
                  )}

                  <div
                    ref={messagesContainerRef}
                    className="flex-1 p-6 space-y-3 overflow-y-auto"
                    style={{
                      background: "linear-gradient(180deg, #F0F8FF 0%, #FFFFFF 100%)",
                    }}
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
                            senderName={isOwn ? "Você" : selectedContact.name}
                            timestamp={new Date(msg.sentAt)}
                            avatar={isOwn ? user?.avatar : selectedContact.avatar}

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
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <input
                        value={messageText}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
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
                <div className="h-full flex items-center justify-center bg-gradient-to-b from-[#F0F8FF] to-white">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Send className="w-12 h-12 text-blue-500" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      Selecione um contato para começar a conversar
                    </p>
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