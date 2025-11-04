<<<<<<< Local
<<<<<<< Local
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
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import type { LoginResponse, User, RefreshTokenResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('erp_user');
      const token = localStorage.getItem('auth_token');
      
      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiFetch<{ success: boolean; data: User }>('/api/v1/auth/me');
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('erp_user', JSON.stringify(response.data));
          } else {
            // Token invalid, clear auth
            clearAuth();
          }
        } catch (error) {
          // Token expired or invalid, clear auth
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiFetch<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success && response.data) {
        const { token, refreshToken, user: userData } = response.data;
        
        // Store tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Store user data
        setUser(userData);
        localStorage.setItem('erp_user', JSON.stringify(userData));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await apiFetch<RefreshTokenResponse>('/api/v1/auth/refresh', {
        method: 'POST',
        body: { refreshToken: storedRefreshToken },
      });

      if (response.success && response.data) {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        return true;
      }
      
      // Refresh failed, clear auth
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        // Call logout endpoint to revoke refresh token
        await apiFetch('/api/v1/auth/logout', {
          method: 'POST',
          body: { refreshToken: storedRefreshToken },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, refreshToken }}>
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
>>>>>>> Remote
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import type { LoginResponse, User, RefreshTokenResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('erp_user');
      const token = localStorage.getItem('auth_token');
      
      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiFetch<{ success: boolean; data: User }>('/api/v1/auth/me');
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('erp_user', JSON.stringify(response.data));
          } else {
            // Token invalid, clear auth
            clearAuth();
          }
        } catch (error) {
          // Token expired or invalid, clear auth
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiFetch<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success && response.data) {
        const { token, refreshToken, user: userData } = response.data;
        
        // Store tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Store user data
        setUser(userData);
        localStorage.setItem('erp_user', JSON.stringify(userData));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await apiFetch<RefreshTokenResponse>('/api/v1/auth/refresh', {
        method: 'POST',
        body: { refreshToken: storedRefreshToken },
      });

      if (response.success && response.data) {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        return true;
      }
      
      // Refresh failed, clear auth
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        // Call logout endpoint to revoke refresh token
        await apiFetch('/api/v1/auth/logout', {
          method: 'POST',
          body: { refreshToken: storedRefreshToken },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, refreshToken }}>
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
>>>>>>> Remote
