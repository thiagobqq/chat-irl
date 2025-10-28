import * as signalR from '@microsoft/signalr';
import type { Message } from '../types/chat';
import { normalizeMessage  } from '../Utils/mappers';

const API_BASE_URL = 'http://localhost:5000';

interface SignalRCallbacks {
  onReceiveMessage?: (message: Message) => void;
  onMessageSent?: (message: Message) => void;
  onReceiveGroupMessage?: (message: Message) => void;
  onUserJoinedGroup?: (userId: string, groupId: number) => void;
  onUserLeftGroup?: (userId: string, groupId: number) => void;
  onUserConnected?: (userId: string) => void;
  onUserDisconnected?: (userId: string) => void;
  onOnlineUsers?: (users: string[]) => void;
  onUserTyping?: (userId: string) => void;
  onUserStoppedTyping?: (userId: string) => void;
  onError?: (error: string) => void;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: SignalRCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private hubUrl: string;

  constructor(baseUrl?: string) {
    this.hubUrl = `${baseUrl || API_BASE_URL}/chathub`;
  }

  setHubUrl(url: string) {
    this.hubUrl = url;
  }

  async connect(token: string, callbacks: SignalRCallbacks) {
    this.callbacks = callbacks;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null;
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('✅ Conectado ao SignalR em:', this.hubUrl);
      this.reconnectAttempts = 0;
      return true;
    } catch (err) {
      console.error('❌ Erro ao conectar ao SignalR:', err);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(token, callbacks), 5000);
      }
      
      return false;
    }
  }

  private setupEventHandlers() {
  if (!this.connection) return;

  this.connection.on('ReceiveMessage', (apiMessage: any) => {
    console.log('📨 Mensagem recebida (bruta):', apiMessage);
    try {
      const message = normalizeMessage(apiMessage);
      console.log('📨 Mensagem normalizada:', message);
      this.callbacks.onReceiveMessage?.(message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error, apiMessage);
    }
  });

  this.connection.on('MessageSent', (apiMessage: any) => {
    console.log('✅ Mensagem enviada (bruta):', apiMessage);
    try {
      const message = normalizeMessage(apiMessage);
      console.log('✅ Mensagem enviada (normalizada):', message);
      this.callbacks.onMessageSent?.(message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem enviada:', error, apiMessage);
    }
  });

  this.connection.on('ReceiveGroupMessage', (apiMessage: any) => {
    console.log('📨 Mensagem de grupo (bruta):', apiMessage);
    try {
      const message = normalizeMessage(apiMessage);
      console.log('📨 Mensagem de grupo (normalizada):', message);
      this.callbacks.onReceiveGroupMessage?.(message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem de grupo:', error, apiMessage);
    }
  });

    this.connection.on('UserJoinedGroup', (userId: string, groupId: number) => {
      this.callbacks.onUserJoinedGroup?.(userId, groupId);
    });

    this.connection.on('UserLeftGroup', (userId: string, groupId: number) => {
      this.callbacks.onUserLeftGroup?.(userId, groupId);
    });

    this.connection.on('UserConnected', (userId: string) => {
      this.callbacks.onUserConnected?.(userId);
    });

    this.connection.on('UserDisconnected', (userId: string) => {
      this.callbacks.onUserDisconnected?.(userId);
    });

    this.connection.on('OnlineUsers', (users: string[]) => {
      this.callbacks.onOnlineUsers?.(users);
    });

    this.connection.on('UserTyping', (userId: string) => {
      this.callbacks.onUserTyping?.(userId);
    });

    this.connection.on('UserStoppedTyping', (userId: string) => {
      this.callbacks.onUserStoppedTyping?.(userId);
    });

    this.connection.on('Error', (error: string) => {
      this.callbacks.onError?.(error);
    });

    this.connection.onreconnecting((error) => {
      console.log('🔄 Reconectando ao SignalR...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ Reconectado ao SignalR:', connectionId);
    });

    this.connection.onclose((error) => {
      console.log('❌ Conexão SignalR fechada:', error);
    });
  }

  async sendMessageToUser(receiverId: string, message: string): Promise<void> {
    if (!this.connection) throw new Error('Não conectado ao SignalR');
    
    await this.connection.invoke('SendMessageToUser', {
      receiverId,
      message,
    });
  }

  async sendMessageToGroup(groupId: number, message: string): Promise<void> {
    if (!this.connection) throw new Error('Não conectado ao SignalR');
    
    await this.connection.invoke('SendMessageToGroup', groupId, message);
  }

  async joinGroup(groupId: number): Promise<void> {
    if (!this.connection) throw new Error('Não conectado ao SignalR');
    
    await this.connection.invoke('JoinGroup', groupId);
  }

  async leaveGroup(groupId: number): Promise<void> {
    if (!this.connection) throw new Error('Não conectado ao SignalR');
    
    await this.connection.invoke('LeaveGroup', groupId);
  }

  async startTyping(receiverId: string): Promise<void> {
    if (!this.connection) return;
    
    try {
      await this.connection.invoke('StartTyping', receiverId);
    } catch (error) {
      console.error('Erro ao enviar indicador de digitação:', error);
    }
  }

  async stopTyping(receiverId: string): Promise<void> {
    if (!this.connection) return;
    
    try {
      await this.connection.invoke('StopTyping', receiverId);
    } catch (error) {
      console.error('Erro ao parar indicador de digitação:', error);
    }
  }

  async markMessagesAsRead(senderId: string): Promise<void> {
    if (!this.connection) return;
    
    try {
      await this.connection.invoke('MarkMessagesAsRead', senderId);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();