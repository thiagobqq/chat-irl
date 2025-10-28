import { useEffect, useState } from 'react';
import type { Message } from '../types/chat';

interface UseSignalRProps {
  currentReceiverId?: string | null;
  currentGroupId?: number | null;
  onReceiveMessage?: (message: Message) => void;
  onReceiveGroupMessage?: (message: Message) => void;
  onUserStatusChange?: (userId: string, isOnline: boolean) => void;
  onUserTyping?: (userId: string) => void;
  onUserStoppedTyping?: (userId: string) => void;
}

export function useSignalR({
  currentReceiverId,
  currentGroupId,
  onReceiveMessage,
  onReceiveGroupMessage,
  onUserStatusChange,
  onUserTyping,
  onUserStoppedTyping,
}: UseSignalRProps) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // Este hook não precisa fazer setup dos callbacks
    // pois eles já estão sendo configurados no AuthContext
    // Aqui só mantemos o estado de usuários online
  }, [currentReceiverId, currentGroupId, onReceiveMessage, onReceiveGroupMessage, onUserStatusChange, onUserTyping, onUserStoppedTyping]);

  return {
    onlineUsers,
  };
}