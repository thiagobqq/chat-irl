import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../Services/api';
import { signalRService } from '../Services/signalr';
import type { Message } from '../types/chat';

interface User {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  backgroundPicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userName: string, email: string, password: string) => Promise<void>;
  setUser: (user: User) => void;
  registerMessageHandler: (handler: (message: Message) => void) => void;
  unregisterMessageHandler: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  
  const messageHandlerRef = useRef<((message: Message) => void) | null>(null);
  const groupMessageHandlerRef = useRef<((message: Message) => void) | null>(null);

  useEffect(() => {
    const savedToken = apiService.getToken();
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      connectToSignalR(savedToken);
    }
  }, []);

  const connectToSignalR = async (authToken: string) => {
    const connected = await signalRService.connect(authToken, {
      onMessageSent: (message: Message) => {
        if (messageHandlerRef.current) {
          messageHandlerRef.current(message);
        }
      },
      onReceiveMessage: (message: Message) => {
        if (messageHandlerRef.current) {
          messageHandlerRef.current(message);
        }
      },
      onReceiveGroupMessage: (message: Message) => {
        if (groupMessageHandlerRef.current) {
          groupMessageHandlerRef.current(message);
        }
      },
      onError: (error: any) => {
        console.error('SignalR Error:', error);
      },
    });
    
    setIsConnected(connected);
  };

  const registerMessageHandler = (handler: (message: Message) => void) => {
    messageHandlerRef.current = handler;
  };

  const unregisterMessageHandler = () => {
    messageHandlerRef.current = null;
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    
    const userData: User = {
      id: response.userId || response.id,
      userName: response.userName,
      email: response.email,
      avatar: response.profilePicture, 
      backgroundPicture: response.backgroundPicture,
    };

    setUser(userData);
    setToken(response.token);
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    await connectToSignalR(response.token);
    
    navigate('/perfil');
  };

  const register = async (userName: string, email: string, password: string) => {
    await apiService.register(userName, email, password);
    await login(email, password);
  };

  const logout = () => {
    signalRService.disconnect();
    apiService.clearToken();
    
    setUser(null);
    setToken(null);
    setIsConnected(false);
    
    localStorage.removeItem('user');
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isConnected,
        login,
        logout,
        register,
        setUser,
        registerMessageHandler,
        unregisterMessageHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}