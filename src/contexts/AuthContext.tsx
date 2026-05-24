import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  profilePhotoURL?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and user data
    const savedToken = localStorage.getItem('ustaad_token');
    const savedUser = localStorage.getItem('ustaad_user');
    const tokenTimestamp = localStorage.getItem('ustaad_token_timestamp');

    if (savedToken && savedUser && tokenTimestamp) {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      // Auto logout after 30 days
      if (now - parseInt(tokenTimestamp) > thirtyDays) {
        logout();
      } else {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ustaad_user', JSON.stringify(userData));
    localStorage.setItem('ustaad_token', 'mock_token_' + Math.random().toString(36).substr(2));
    localStorage.setItem('ustaad_token_timestamp', Date.now().toString());
    localStorage.setItem('ustaad_role', userData.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ustaad_user');
    localStorage.removeItem('ustaad_token');
    localStorage.removeItem('ustaad_token_timestamp');
    localStorage.removeItem('ustaad_role');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
