import type { User, Message, Conversation, Group } from '../types/chat';
import { normalizeMessages } from '../Utils/mappers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

interface LoginResponse {
  token: string;
  userId: string;
  id: string;
  userName: string;
  email: string;
  profilePicture: string;
  backgroundPicture: string;
}

interface UserDTO {
  username: string;
  profilePicture: string;
  backgroundPicture: string;
  description: string;
  status: number;
}

class ApiService {
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const fullUrl = `${this.baseUrl}/api${url}`;
    
    console.log('🌐 Fazendo requisição:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `Erro: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Resposta da API:', data);
    
    return data;
  }

  // ==================== AUTH ====================
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao fazer login' }));
      throw new Error(error.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao registrar' }));
      throw new Error(error.message || 'Erro ao registrar');
    }

    return response.json();
  }

  // ==================== USERS ====================
  async getCurrentUser(): Promise<User> {
    return this.fetchWithAuth('/user/me');
  }

  async getUserById(userId: string): Promise<User> {
    return this.fetchWithAuth(`/user/${userId}`);
  }

  async getAllUsers(): Promise<User[]> {
    const data = await this.fetchWithAuth('/user/all');
    return Array.isArray(data) ? data : [];
  }

  async updateUserProfile(userDto: UserDTO): Promise<void> {
  const token = this.getToken();
  
  if (!token) {
    throw new Error('Você precisa estar logado para atualizar o perfil');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(`${this.baseUrl}/api/user/update`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(userDto)
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `Erro: ${response.status}`;
    
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json().catch(() => ({}));
      errorMessage = error.message || error.title || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  // Tenta fazer parse do JSON apenas se houver conteúdo
  const text = await response.text();
  if (text) {
    JSON.parse(text);
  }
}

  async getUsers(): Promise<User[]> {
    const data = await this.fetchWithAuth('/chat/users');
    return Array.isArray(data) ? data : [];
  }

  // ==================== CONVERSATIONS ====================
  async getConversations(): Promise<Conversation[]> {
    const data = await this.fetchWithAuth('/chat/conversations');
    return Array.isArray(data) ? data : [];
  }

  async getChatHistory(userId: string): Promise<Message[]> {
    try {
      const data = await this.fetchWithAuth(`/chat/history/${userId}`);
      console.log('📥 Mensagens brutas do backend:', data);
      
      // Verificar estrutura
      if (!Array.isArray(data)) {
        console.error('❌ Resposta não é um array:', data);
        return [];
      }

      // Mostrar primeira mensagem para debug
      if (data.length > 0) {
        console.log('🔍 Exemplo de mensagem:', data[0]);
        console.log('🔍 Campos disponíveis:', Object.keys(data[0]));
      }
      
      const normalized = normalizeMessages(data);
      console.log('✅ Mensagens normalizadas:', normalized);
      
      return normalized;
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      return [];
    }
  }

  // ==================== GROUPS ====================
  async getMyGroups(): Promise<Group[]> {
    const data = await this.fetchWithAuth('/group/meus-grupos');
    return Array.isArray(data) ? data : [];
  }

  async createGroup(name: string, description: string, users: string[]): Promise<Group> {
    return this.fetchWithAuth('/group', {
      method: 'POST',
      body: JSON.stringify({ name, description, users }),
    });
  }

  async getGroupMessages(groupId: number): Promise<Message[]> {
    try {
      const data = await this.fetchWithAuth(`/group/${groupId}/messages`);
      console.log('📥 Mensagens do grupo (brutas):', data);
      
      if (!Array.isArray(data)) {
        console.error('❌ Resposta não é um array:', data);
        return [];
      }
      
      const normalized = normalizeMessages(data);
      console.log('✅ Mensagens do grupo (normalizadas):', normalized);
      
      return normalized;
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens do grupo:', error);
      return [];
    }
  }

  async addMemberToGroup(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/add-member`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeMemberFromGroup(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/remove-member`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export const apiService = new ApiService();