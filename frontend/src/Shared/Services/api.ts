import type { User, Message, Conversation, Group, GroupMember } from '../types/chat';
import { normalizeGroup, normalizeMessages } from '../Utils/mappers';

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
    
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `Erro: ${response.status}`);
    }

    const data = await response.json();
    
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

  async deleteCurrentUser(): Promise<boolean | null> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/api/user/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erro: ${response.status}` }));
      throw new Error(error.message || `Erro: ${response.status}`);
    }

    if (response.status === 204) return null;
    return true;
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
      
      // Verificar estrutura
      if (!Array.isArray(data)) {
        console.error('❌ Resposta não é um array:', data);
        return [];
      }

    
      
      const normalized = normalizeMessages(data);
      
      return normalized;
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      return [];
    }
  }

  // ==================== GROUPS ====================
  async getMyGroups(): Promise<Group[]> {
    try {
      const response = await this.fetchWithAuth('/group/meus-grupos');
      
      const data = response.data || response;
      
      if (!Array.isArray(data)) {
        console.error('❌ Resposta não é um array:', data);
        return [];
      }
      
      return data.map((group: any) => ({
        ...group, 
        id: group.id,
        
        name: group.name || group.nome || 'Sem Nome',
        nome: group.name || group.nome || 'Sem Nome',
        
        members: group.members || [],
        
        users: group.members || group.users || [] 
      }));
      
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      return []; 
    }
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
      
      if (!Array.isArray(data)) {
        console.error('❌ Resposta não é um array:', data);
        return [];
      }
      
      const normalized = normalizeMessages(data);
      
      return normalized;
    } catch (error) {
       console.error('❌ Erro ao carregar mensagens do grupo:', error);
      return [];
    }
  }

  async addMemberToGroup(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/add/${userId}`, {
      method: 'POST'
    });
  }

  async removeMemberFromGroup(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/remove/${userId}`, {
      method: 'POST'
    });
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const data = await this.fetchWithAuth(`/group/${groupId}/members`);
    return Array.isArray(data) ? data : [];
  }

   async promoteToAdmin(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/promote/${userId}`, {
      method: 'POST'
    });
  }

  async demoteFromAdmin(groupId: number, userId: string) {
    return this.fetchWithAuth(`/group/${groupId}/demote/${userId}`, {
      method: 'POST'
    });
  }
  async removeMember(groupId: number, userId: string) {
    return this.removeMemberFromGroup(groupId, userId);
  }
}

export const apiService = new ApiService();