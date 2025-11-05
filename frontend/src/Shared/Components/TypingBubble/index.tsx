import { useEffect, useState } from 'react';


interface TypingIndicatorProps {
  userName?: string;
  avatar?: string;
  className?: string;
}

export function TypingBubble({ userName = "Alguém", avatar }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-500">
        {avatar ? (
          <img 
            src={avatar} 
            alt={userName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-sm">${userName.charAt(0).toUpperCase()}</span>`;
            }}
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[120px]">
        <div className="flex gap-1 items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing-dot [animation-delay:0ms]"></div>
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing-dot [animation-delay:200ms]"></div>
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing-dot [animation-delay:400ms]"></div>
        </div>
      </div>
    </div>
  );
}