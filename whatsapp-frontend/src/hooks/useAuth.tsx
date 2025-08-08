import { createContext, useContext, useEffect, useState } from "react";
import { validateToken } from "@/lib/auth";

// Definimos el tipo de usuario esperado
interface User {
  id: string;
  name: string;
  email: string;
}

// Tipos del contexto
interface AuthContextType {
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
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
  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      const token = data.data?.token;
      if (token) {
        if (rememberMe) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }
      }

      setIsAuthenticated(true);
      setUser(data.data.user);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error desconocido");
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignoramos si no hay conexión o el endpoint no existe
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
