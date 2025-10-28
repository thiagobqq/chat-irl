import { useState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import { XPWindow } from "../../Shared/Components/XPWindow";
import { ContactList } from "../../Shared/Components/ContactList";
import { MessageBubble } from "../../Shared/Components/MessageBubble";
import { StatusIndicator } from "../../Shared/Components/StatusIndicator";
import { useAuth } from "../../Shared/Contexts";
import { apiService } from "../../Shared/Services/api";
import { signalRService } from "../../Shared/Services/signalr";
import type { Contact, Message } from "../../Shared/types/chat";

export function Chat() {
  const { user, isConnected } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  // Carregar usuários
  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  // Carregar histórico quando selecionar contato
  useEffect(() => {
    if (selectedContact) {
      loadChatHistory(selectedContact.id);
    } else {
      setMessages([]);
    }
  }, [selectedContact?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Setup de callbacks do SignalR
  useEffect(() => {
    if (!isConnected) return;

    // Note: Os callbacks já estão configurados no AuthContext,
    // mas precisamos atualizar o estado local quando receber mensagens
    const checkMessages = setInterval(() => {
      if (selectedContact) {
        loadChatHistory(selectedContact.id);
      }
    }, 3000);

    return () => clearInterval(checkMessages);
  }, [isConnected, selectedContact?.id]);

  const loadUsers = async () => {
    try {
      const users = await apiService.getUsers();
      console.log('👥 Usuários carregados:', users);
      
      const mappedContacts: Contact[] = users
        .filter((u) => u.id !== user?.id)
        .map((u) => ({
          id: u.id,
          name: u.userName,
          email: u.email,
          status: u.isOnline ? "available" : "offline",
        }));
      
      console.log('📋 Contatos mapeados:', mappedContacts);
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const loadChatHistory = async (userId: string) => {
    try {
      console.log('📜 Carregando histórico com:', userId);
      const history = await apiService.getChatHistory(userId);
      console.log('📨 Histórico recebido:', history);
      console.log('👤 User ID atual:', user?.id);
      
      // Verificar cada mensagem
      history.forEach(msg => {
        console.log('📝 Mensagem:', {
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          isOwn: msg.senderId === user?.id,
          content: msg.message
        });
      });
      
      setMessages(history);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact || !isConnected) return;

    try {
      console.log('📤 Enviando mensagem:', {
        to: selectedContact.id,
        message: messageText
      });
      
      await signalRService.sendMessageToUser(selectedContact.id, messageText);
      setMessageText("");
      
      // Recarregar mensagens após enviar
      setTimeout(() => {
        loadChatHistory(selectedContact.id);
      }, 500);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Enviar indicador de digitação
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
            {/* Lista de Contatos */}
            <div className="flex flex-col overflow-hidden">
              <ContactList
                contacts={contacts}
                selectedContact={selectedContact}
                onSelectContact={setSelectedContact}
              />
            </div>

            {/* Área de Chat */}
            <div className="flex flex-col overflow-hidden">
              <XPWindow
                title={
                  selectedContact
                    ? `Conversa com ${selectedContact.name}`
                    : "Selecione um contato"
                }
                icon={
                  selectedContact ? (
                    <StatusIndicator status={selectedContact.status} />
                  ) : null
                }
              >
                {selectedContact ? (
                  <div className="flex flex-col h-full">
                    {/* Indicador de digitação */}
                    {isTyping && (
                      <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                        <p className="text-blue-600 text-sm">
                          {selectedContact.name} está digitando...
                        </p>
                      </div>
                    )}

                    {/* Mensagens */}
                    <div
                      className="flex-1 overflow-y-auto p-6 space-y-3"
                      style={{
                        background:
                          "linear-gradient(180deg, #F0F8FF 0%, #FFFFFF 100%)",
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
                          
                          console.log('🎨 Renderizando:', {
                            msgId: msg.id,
                            senderId: String(msg.senderId),
                            currentUserId: String(user?.id),
                            isOwn,
                            side: isOwn ? 'direita' : 'esquerda'
                          });
                          
                          return (
                            <MessageBubble
                              key={msg.id}
                              content={msg.message}
                              isOwnMessage={isOwn}
                              senderName={isOwn ? "Você" : selectedContact.name}
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
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 flex-shrink-0"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        <input
                          value={messageText}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
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
    </div>
  );
}