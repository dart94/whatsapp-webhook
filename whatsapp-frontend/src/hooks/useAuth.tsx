"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { login as loginService, validateToken } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Función simple para crear usuario (funciona tanto para login como token)
  const createUser = (userData: any): User | null => {
    if (!userData?.id) return null;
    
    return {
      id: userData.id.toString(),
      name: userData.name || '',
      email: userData.email || '',
      isAdmin: userData.isAdmin === true
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const tokenData = await validateToken();
        
        if (tokenData?.id) {
          const userData = createUser(tokenData);
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error validando token:', error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      setLoading(true);
      
      const response = await loginService(email, password, rememberMe);
      
      // Usar los datos del usuario de la respuesta
      const userData = createUser(response);
      
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        throw new Error('Datos de usuario inválidos');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}