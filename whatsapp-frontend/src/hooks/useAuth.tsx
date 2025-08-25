"use client";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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
  initialized: boolean;
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
  // ✅ Estado consolidado para evitar múltiples updates
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null as User | null,
    loading: true,
    initialized: false
  });

  // ✅ Función memoizada para crear usuario
  const createUser = useCallback((userData: any): User | null => {
    if (!userData?.id) return null;
    
    return {
      id: userData.id.toString(),
      name: userData.name || '',
      email: userData.email || '',
      isAdmin: userData.isAdmin === true
    };
  }, []);

  // ✅ useEffect optimizado - una sola actualización de estado
  useEffect(() => {
    let mounted = true; // Para evitar memory leaks
    
    const initAuth = async () => {
      try {
        console.log('🔍 Iniciando auth...');
        
        const tokenData = await validateToken();
        console.log('🔍 Token data recibido:', tokenData);
        
        if (!mounted) return; // Component unmounted
        
        if (tokenData?.id) {
          const userData = createUser(tokenData);
          console.log('🔍 User data creado:', userData);
          
          // ✅ Una sola actualización de estado
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false,
            initialized: true
          });
        } else {
          console.log('🔍 No hay token válido');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('🔍 Error validando token:', error);
        if (!mounted) return;
        
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          initialized: true
        });
      }
      
      console.log('🔍 Auth inicialización completa');
    };

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, [createUser]);

  // ✅ Login optimizado
  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
  try {
    setAuthState(prev => ({ ...prev, loading: true }));

    // 👉 Hacemos login (esto guarda el token en local/session storage)
    await loginService(email, password, rememberMe);

    // 👉 Inmediatamente validamos el token para obtener el user
    const tokenData = await validateToken();
    const userData = createUser(tokenData);

    if (userData) {
      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false,
        initialized: true
      });
      console.log('🔍 Login exitoso:', userData);
    } else {
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    setAuthState(prev => ({ ...prev, loading: false }));
    throw error instanceof Error ? error : new Error("Error desconocido");
  }
}, [createUser]);

  // ✅ Logout optimizado
  const logout = useCallback(async () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      initialized: true
    });
    
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  // ✅ Memoizar el value del context para evitar re-renders
  const contextValue = useMemo(() => ({
    login,
    logout,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    initialized: authState.initialized
  }), [login, logout, authState]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}