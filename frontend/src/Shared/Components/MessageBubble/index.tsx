interface MessageBubbleProps {
  content: string;
  isOwnMessage: boolean;
  senderName: string;
  timestamp: Date;
  avatar?: string;
}

export function MessageBubble({ 
  content, 
  isOwnMessage, 
  senderName, 
  timestamp,
  avatar
}: MessageBubbleProps) {
  const time = timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Estilos base para o balão, com o padding vertical ajustado para py-2
  const bubbleBaseStyles = `
    relative px-4 py-2 rounded-2xl
    overflow-hidden text-sm shadow-xl
    border-t border-white/60
  `;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-[slideIn_0.2s_ease-out]`}>
      {/* Avatar revertido para o estilo anterior "gota de vidro" */}
      <div className={`
        w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center 
        text-white font-semibold text-sm overflow-hidden relative
        ${isOwnMessage 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
          : 'bg-gradient-to-br from-purple-400 to-purple-600'
        }
        shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)]
        before:absolute before:inset-0 before:rounded-full
        before:bg-gradient-to-b before:from-white/30 before:to-transparent before:opacity-60
      `}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={senderName}
            className="w-full h-full object-cover relative z-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.textContent = senderName.charAt(0).toUpperCase();
            }}
          />
        ) : (
          <span className="relative z-10">{senderName.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {/* --- Corpo da Mensagem com Estilo Retrô/Aqua e tamanho corrigido --- */}
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`${bubbleBaseStyles} ${
          isOwnMessage
            // --- Sua Mensagem (Gota de Gel Azul) ---
            ? `bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded-tr-sm
               border-b border-blue-900/80 shadow-blue-900/40`
            
            // --- Mensagem Recebida (Gota de Gel Neutra/Cinza) ---
            : `bg-gradient-to-b from-slate-100 to-slate-300 text-slate-800 rounded-tl-sm
               border-b border-slate-400/80 shadow-slate-500/30`
        }`}>
          {/* GLOSS HIGHLIGHT: A camada de brilho superior que define o estilo */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 via-white/20 to-transparent" />
          
          <p className="relative z-10 break-words whitespace-pre-wrap">
            {content}
          </p>
        </div>
        
        <span className="text-xs text-gray-500 mt-1.5 px-2 drop-shadow-sm">
          {time}
        </span>
      </div>
    </div>
  );
}