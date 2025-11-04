import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import type { LoginResponse } from '@/types/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'salesperson';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to authenticate with backend
      const response = await apiFetch<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store JWT token
        localStorage.setItem('auth_token', token);
        
        // Store user data
        setUser(userData);
        localStorage.setItem('erp_user', JSON.stringify(userData));
        
        return true;
      }
      return false;
    } catch (error) {
      // Fallback to mock authentication for development
      console.warn('Backend authentication failed, using mock auth:', error);
      
      const mockUsers = [
        { id: '1', email: 'owner@example.com', password: 'owner123', name: 'Shop Owner', role: 'owner' as const },
        { id: '2', email: 'sales@example.com', password: 'sales123', name: 'Sales Person', role: 'salesperson' as const },
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Generate mock JWT token
        const mockToken = `mock-jwt-token-${userWithoutPassword.id}-${Date.now()}`;
        localStorage.setItem('auth_token', mockToken);
        
        // Store user data
        setUser(userWithoutPassword);
        localStorage.setItem('erp_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
