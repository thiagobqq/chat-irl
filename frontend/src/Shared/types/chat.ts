export type UserStatusNumber = 0 | 1 | 2 | 3;
export type Status = 'Available' | 'Busy' | 'Away' | 'Offline';
export type ContactStatus = "Available" | "Busy" | "Away" | "Offline";

export interface User {
  id: string;
  userName: string;
  email: string;
  isOnline?: boolean;
  status?: UserStatusNumber;
  description?: string;
  profilePicture?: string;
  backgroundPicture?: string;
}

export interface Contact {
  id: string;          
  name: string;        
  avatar?: string;     
  status: ContactStatus;    
  lastMessage?: string;
  lastMessageDate?: Date; 
  description: string; 
}

export interface Message {
  id: number | string; 
  senderId: string;
  receiverId?: string;
  groupId?: number;
  senderUsername?: string;
  receiverUsername?: string;
  message: string;
  sentAt: string;
  isRead?: boolean;
  group?: {
    id: number;
    name: string;
  };
  isSystemMessage?: boolean;
  systemMessageType?: 'join' | 'leave' | 'info';
}

export interface Conversation {
  userId: string;
  username: string;
  email: string;
  lastMessage: string;
  lastMessageDate: Date | string | null;
  unreadCount: number;
  profilePicture?: string;
  isOnline: boolean;
}

export interface Group {
  id: number;
  nome?: string;
  name?: string;
  descricao?: string;
  description?: string;
  dataCriacao?: string;
  createdAt?: string;
  users: User[];
}