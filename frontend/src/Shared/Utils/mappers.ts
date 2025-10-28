import type { Message } from '../types/chat';

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