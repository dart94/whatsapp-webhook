// src/guards/client.tsx
"use client";

import { PropsWithChildren, ComponentType } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

/** Si hay token en storage, asumimos que el AuthProvider hidratará `user` en breve */
function tokenExists(): boolean {
  if (typeof window === "undefined") return false;
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
}

/** Requiere estar autenticado; si no, redirige a /login?next=... */
export function RequireAuth({
  children,
  redirectTo = "/login",
}: PropsWithChildren<{ redirectTo?: string }>) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = tokenExists();

  useEffect(() => {
    // Si no hay user y tampoco token → redirigir a login
    if (!user && !hasToken) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [user, hasToken, router, pathname, redirectTo]);

  // 🔑 Si HAY token pero aún no hidrata `user`, dejamos pasar al hijo
  if (!user && hasToken) {
    return <>{children}</>;
  }
  // Si no hay user ni token (o aún no se puede determinar), no renderizamos
  if (!user) return null;

  return <>{children}</>;
}

/** Requiere ser admin; si no hay sesión, redirige a login; si no es admin, a /403 */
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
    // Sin user y sin token → a login
    if (!user) {
      if (!hasToken) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`${redirectToLogin}?next=${next}`);
      }
      return;
    }
    // Con user pero no admin → a /403
    if (!user.isAdmin) {
      router.replace(redirectToForbidden);
    }
  }, [user, hasToken, router, pathname, redirectToLogin, redirectToForbidden]);

  // 🔑 Si HAY token pero `user` aún no hidrata, deja pasar al hijo para que sus hooks monten
  if (!user && hasToken) {
    return <>{children}</>;
  }
  // Si no hay user o ya sabemos que no es admin, no renderizamos
  if (!user || !user.isAdmin) return null;

  return <>{children}</>;
}

/** Requiere auth y admin; combina ambos requisitos */
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
    // Sin user y sin token → a login
    if (!user) {
      if (!hasToken) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`${redirectToLogin}?next=${next}`);
      }
      return;
    }
    // Con user pero no admin → a /403
    if (!user.isAdmin) {
      router.replace(redirectToForbidden);
      return;
    }
  }, [user, hasToken, router, pathname, redirectToLogin, redirectToForbidden]);

  // 🔑 Si HAY token pero `user` aún no hidrata, deja pasar al hijo
  if (!user && hasToken) {
    return <>{children}</>;
  }
  // Si no hay user o ya sabemos que no es admin, no renderizamos
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
