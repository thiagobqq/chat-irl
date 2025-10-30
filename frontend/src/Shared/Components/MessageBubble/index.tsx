interface MessageBubbleProps {
  content: string;
  isOwnMessage: boolean;
  senderName: string;
  timestamp: Date;
  avatar?: string; // Adicionar esta propriedade
}

export function MessageBubble({ 
  content, 
  isOwnMessage, 
  senderName, 
  timestamp,
  avatar // Adicionar aqui
}: MessageBubbleProps) {
  const time = timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-[slideIn_0.2s_ease-out]`}>
      {/* Avatar */}
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden ${
        isOwnMessage 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
          : 'bg-gradient-to-br from-purple-400 to-purple-600'
      }`}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={senderName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar ao carregar, mostra a letra
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.textContent = senderName.charAt(0).toUpperCase();
            }}
          />
        ) : (
          senderName.charAt(0).toUpperCase()
        )}
      </div>

      {/* Mensagem */}
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2 rounded-2xl shadow-md ${
          isOwnMessage
            ? 'bg-gradient-to-br from-[#0078D4] to-[#0058B8] text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}>
          <p className="text-sm break-words whitespace-pre-wrap">{content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-2">
          {time}
        </span>
      </div>
    </div>
  );
}