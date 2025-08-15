"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { login as loginService, validateToken } from "@/lib/auth";
import { User } from "@/types/user"; // Asegúrate de que este tipo esté definido correctamente



// Tipos del contexto
interface AuthContextType {
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
    isAdmin: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de Auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

// Función auxiliar para obtener el token de donde esté guardado
function getStoredToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Validamos el token al cargar la app
  useEffect(() => {
    validateToken().then((tokenPayload) => {
      if (tokenPayload?.user) {
        setIsAuthenticated(true);
        setUser(tokenPayload.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
  }, []);

  // Iniciar sesión
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean,
    isAdmin: boolean
  ) => {
    try {
      const response = await loginService(email, password, rememberMe, isAdmin); // <- USANDO loginService

      setIsAuthenticated(true);
      setUser(response.data?.user || null);
      
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error desconocido");
    }
  };

  // Cerrar sesión
const logout = async () => {
  try {
    // 1. Actualizar estado inmediatamente para mejor UX
    setIsAuthenticated(false);
    setUser(null);
    
    // 2. Limpiar almacenamiento
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    // 3. Redirigir (usar router de Next.js si está disponible)
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
    
  } catch (error) {
    console.error('Error durante el logout:', error);
    
    // Asegurar limpieza en caso de error
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
  }
};


  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
