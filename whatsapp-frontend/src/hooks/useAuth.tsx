"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { login as loginService, validateToken } from "@/lib/auth";
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserUpdateData,
  LoginResponse,
  TokenValidationResponse
} from "@/types/user";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean; // <- importante
}

interface AuthContextType {
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

function getStoredToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Normaliza el usuario para asegurar isAdmin
  const normalizeUser = (rawUser: any): User => {
    if (!rawUser)  null;
    return {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      isAdmin:
        typeof rawUser.isAdmin === "boolean"
          ? rawUser.isAdmin
          : rawUser.role === "admin" || rawUser.roleId === 1
    };
  };

  useEffect(() => {
    validateToken().then((tokenPayload) => {
      if (tokenPayload?.user) {
        setIsAuthenticated(true);
        setUser(normalizeUser(tokenPayload.user));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    try {
      const response = await loginService(email, password, rememberMe);

      setIsAuthenticated(true);
      setUser(normalizeUser(response.data?.user || null));
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error desconocido");
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error durante el logout:", error);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
      if (typeof window !== "undefined") {
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
