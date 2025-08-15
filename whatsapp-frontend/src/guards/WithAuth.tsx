// src/guards/client.tsx
"use client";

import { PropsWithChildren, ComponentType } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

// 🆕 helper: si hay token, asumimos que el AuthProvider está por hidratar el user
function tokenExists(): boolean {
  if (typeof window === "undefined") return false;
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
}

/** Componente: exige estar autenticado; si no, redirige a /login?next=... */
export function RequireAuth({
  children,
  redirectTo = "/login",
}: PropsWithChildren<{ redirectTo?: string }>) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = tokenExists();

  useEffect(() => {
    // ⛔️ no redirigir si hay token pero aún no se ha hidratado user
    if (!user && !hasToken) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [user, hasToken, router, pathname, redirectTo]);

  // Mientras haya token pero user sea null, esperamos a que el provider lo setee
  if (!user && hasToken) {
    return (
      <div className="h-screen grid place-items-center text-gray-500">
        Cargando…
      </div>
    );
  }
  if (!user) return null;

  return <>{children}</>;
}

/** Componente: exige ser admin; si no, redirige a /403 (o a login si no hay sesión) */
export function RequireAdmin({
  children,
  redirectToLogin = "/login",
  redirectToForbidden = "/403",
}: PropsWithChildren<{
  redirectToLogin?: string;
  redirectToForbidden?: string;
}>) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = tokenExists();

  useEffect(() => {
    if (!user) {
      if (!hasToken) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`${redirectToLogin}?next=${next}`);
      }
      return;
    }
    if (!user.isAdmin) {
      router.replace(redirectToForbidden);
    }
  }, [user, hasToken, router, pathname, redirectToLogin, redirectToForbidden]);

  if (!user && hasToken) {
    return (
      <div className="h-screen grid place-items-center text-gray-500">
        Cargando…
      </div>
    );
  }
  if (!user || !user.isAdmin) return null;

  return <>{children}</>;
}

// Componente: exige estar autenticado y ser admin
export function RequireAuthAndAdmin({
  children,
  redirectToLogin = "/login",
  redirectToForbidden = "/403",
}: PropsWithChildren<{
  redirectToLogin?: string;
  redirectToForbidden?: string;
}>) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = tokenExists();

  useEffect(() => {
    if (!user) {
      if (!hasToken) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`${redirectToLogin}?next=${next}`);
      }
      return;
    }
    if (!user.isAdmin) {
      router.replace(redirectToForbidden);
      return;
    }
  }, [user, hasToken, router, pathname, redirectToLogin, redirectToForbidden]);

  if (!user && hasToken) {
    return (
      <div className="h-screen grid place-items-center text-gray-500">
        Cargando…
      </div>
    );
  }
  if (!user || !user.isAdmin) return null;

  return <>{children}</>;
}

/** HOC: requiere auth */
export function withAuth<P extends object>(Wrapped: ComponentType<P>) {
  const Guarded: React.FC<P> = (props) => (
    <RequireAuth>
      <Wrapped {...props} />
    </RequireAuth>
  );
  Guarded.displayName = `withAuth(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return Guarded;
}

/** HOC: requiere admin */
export function withAdmin<P extends object>(Wrapped: ComponentType<P>) {
  const Guarded: React.FC<P> = (props) => (
    <RequireAdmin>
      <Wrapped {...props} />
    </RequireAdmin>
  );
  Guarded.displayName = `withAdmin(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return Guarded;
}

/** HOC: requiere auth y admin */
export function withAuthAndAdmin<P extends object>(Wrapped: ComponentType<P>) {
  const Guarded: React.FC<P> = (props) => (
    <RequireAuthAndAdmin>
      <Wrapped {...props} />
    </RequireAuthAndAdmin>
  );
  Guarded.displayName = `withAuthAndAdmin(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return Guarded;
}
