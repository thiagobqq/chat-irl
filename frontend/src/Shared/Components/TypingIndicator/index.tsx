import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  userName?: string;
  avatar?: string;
  className?: string;
}

export function TypingIndicator({ userName = "Alguém", className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 bg-gray-200 rounded-full px-4 py-2">
        <span className="text-sm text-gray-600 mr-2">{userName} está digitando</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

