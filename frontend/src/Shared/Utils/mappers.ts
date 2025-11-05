import type { Group, Message } from '../types/chat';

/**
 * Normaliza mensagem do backend
 * O backend já retorna em camelCase, só precisamos garantir que id seja string
 */
export function normalizeMessage(apiMessage: any): Message {
  return {
    id: apiMessage.id?.toString() || apiMessage.id, // ID pode vir como number ou string
    senderId: apiMessage.senderId,
    receiverId: apiMessage.receiverId,
    groupId: apiMessage.groupId,
    senderUsername: apiMessage.senderUsername,
    receiverUsername: apiMessage.receiverUsername,
    message: apiMessage.message,
    sentAt: apiMessage.sentAt,
    isRead: apiMessage.isRead ?? false,
  };
}

/**
 * Normaliza array de mensagens
 */
export function normalizeMessages(apiMessages: any[]): Message[] {
  if (!Array.isArray(apiMessages)) {
    console.error('normalizeMessages: expected array, got:', apiMessages);
    return [];
  }
  
  return apiMessages.map(normalizeMessage);
}

/**
 * Converte qualquer objeto de PascalCase para camelCase (mantido para outros usos)
 */
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: any = {};
    
    Object.keys(obj).forEach(key => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      newObj[camelKey] = toCamelCase(obj[key]);
    });
    
    return newObj;
  }
  
  return obj;
}


export type UserStatusNumber = 0 | 1 | 2 | 3;
export type UserStatusString = 'Available' | 'Busy' | 'Away' | 'Offline';
export type StatusUI = 'available' | 'busy' | 'away' | 'offline';

// Conversão de número para string (backend → app)
export const statusToString: Record<UserStatusNumber, UserStatusString> = {
  0: 'Available',
  1: 'Busy',
  2: 'Away',
  3: 'Offline',
};

// Conversão de string para número (app → backend)
export const statusToNumber: Record<UserStatusString, UserStatusNumber> = {
  'Available': 0,
  'Busy': 1,
  'Away': 2,
  'Offline': 3,
};

// Conversão de string para UI (app → componentes)
export const statusToUI: Record<UserStatusString, StatusUI> = {
  'Available': 'available',
  'Busy': 'busy',
  'Away': 'away',
  'Offline': 'offline',
};

// Conversão de UI para string (componentes → app)
export const uiToStatus: Record<StatusUI, UserStatusString> = {
  'available': 'Available',
  'busy': 'Busy',
  'away': 'Away',
  'offline': 'Offline',
};

/**
 * Converte status numérico do backend para string
 */
export function convertStatusToString(status?: UserStatusNumber): UserStatusString {
  if (status === undefined || status === null) return 'Available';
  return statusToString[status] || 'Available';
}

/**
 * Converte string para número (para enviar ao backend)
 */
export function convertStatusToNumber(status: UserStatusString): UserStatusNumber {
  return statusToNumber[status];
}

/**
 * Converte status para formato de UI (lowercase)
 */
export function convertToUI(status?: UserStatusString | UserStatusNumber): StatusUI {
  if (status === undefined || status === null) return 'offline';
  
  // Se for número, converte para string primeiro
  if (typeof status === 'number') {
    const statusString = statusToString[status as UserStatusNumber];
    return statusToUI[statusString] || 'offline';
  }
  
  // Se for string, converte para UI
  return statusToUI[status as UserStatusString] || 'offline';
}

/**
 * Converte status de UI (lowercase) para string (uppercase)
 */
export function convertFromUI(status: StatusUI): UserStatusString {
  return uiToStatus[status];
}

export const normalizeGroup = (apiGroup: any): Group => {
  return {
    id: apiGroup.id,
    nome: apiGroup.nome,
    name: apiGroup.nome, 
    descricao: apiGroup.descricao,
    description: apiGroup.descricao,
    dataCriacao: apiGroup.dataCriacao,
    createdAt: apiGroup.dataCriacao,
    users: apiGroup.users || []
  };
};