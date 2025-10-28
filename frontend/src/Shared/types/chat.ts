export type Status = "available" | "busy" | "away" | "offline";

export interface User {
  id: string;
  userName: string;
  email: string;
  isOnline?: boolean;
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
  lastMessage: string;
  unreadCount: number;
}

export interface Group {
  id: number;
  nome: string;
  name: string;
  description: string;
  users: string[];
}