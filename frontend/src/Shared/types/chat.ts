export type UserStatusNumber = 0 | 1 | 2 | 3;
export type Status = 'Available' | 'Busy' | 'Away' | 'Offline';

export interface User {
  id: string;
  userName: string;
  email: string;
  isOnline?: boolean;
  status?: UserStatusNumber; // Backend envia como número
  description?: string;
  profilePicture?: string;
  backgroundPicture?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  status: Status;
  lastMessage?: string;
  avatar?: string;
}

export interface Message {
  id: number | string; 
  senderId: string;
  receiverId?: string;
  groupId?: number;
  senderUsername: string;
  receiverUsername?: string;
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface Conversation {
  userId: string;
  username: string;
  email: string;
  lastMessage: string;
  lastMessageDate: Date | string | null;
  unreadCount: number;
  isOnline: boolean;
}

export interface Group {
  id: number;
  nome: string;
  name: string;
  description: string;
  users: string[];
}