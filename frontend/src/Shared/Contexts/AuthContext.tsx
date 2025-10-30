import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../Services/api';
import { signalRService } from '../Services/signalr';

interface User {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há token salvo
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
      onError: (error: any) => {
        console.error('SignalR Error:', error);
      },
    });
    
    setIsConnected(connected);
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    
    const userData: User = {
      id: response.userId || response.id,
      userName: response.userName,
      email: response.email,
      avatar: response.profilePicture, 
    };

    setUser(userData);
    setToken(response.token);
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    await connectToSignalR(response.token);
    
    navigate('/chat');
  };

  const register = async (userName: string, email: string, password: string) => {
    await apiService.register(userName, email, password);
    // Após registrar, fazer login automaticamente
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