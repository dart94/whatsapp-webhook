"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  PencilSquareIcon,
  EyeIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ArrowLeftCircleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "@/hooks/useAuth";
import { showSweetAlert } from "./common/Sweet";

/* -------------------- Helpers robustos -------------------- */

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function parseJwt(token: string | null): any | null {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = decodeURIComponent(
      atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function deriveSnapshot(userFromCtx: any): {
  isAdmin: boolean;
  name: string | null;
  email: string | null;
  hasUser: boolean;
  stamp: string;
} {
  // 1) Preferir contexto si ya está listo
  if (userFromCtx && typeof userFromCtx === "object") {
    return {
      isAdmin: !!userFromCtx.isAdmin,
      name: userFromCtx.name || null,
      email: userFromCtx.email || null,
      hasUser: true,
      stamp: `ctx-${userFromCtx.id ?? "x"}-${userFromCtx.isAdmin ? 1 : 0}`,
    };
  }

  // 2) Fallback: JWT del storage (por si el login ya guardó el token pero el ctx aún no refresca)
  const token = getStoredToken();
  const payload = parseJwt(token);
  const isAdmin =
    !!payload?.isAdmin ||
    (typeof payload?.role === "string" &&
      payload.role.toLowerCase() === "admin");

  return {
    isAdmin,
    name: (payload?.name as string) || null,
    email: (payload?.email as string) || null,
    hasUser: !!payload,
    stamp: `jwt-${payload?.sub ?? "x"}-${isAdmin ? 1 : 0}`,
  };
}

/* -------------------- Tipos -------------------- */

interface NavLinkProps {
  href: string;
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
  adminOnly?: boolean;
}

interface SubNavLinkProps extends Omit<NavLinkProps, "active"> {
  active: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

/* -------------------- Componente -------------------- */

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { logout, user, loading, initialized } = useAuth();

  // Oculta el sidebar en la pantalla de login
  if (pathname === "/login") return null;

  // Detecta mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sincroniza submenú según ruta
  useEffect(() => {
    setOpenTemplates(pathname.startsWith("/templates"));
  }, [pathname]);

  // Snapshot de auth: mezcla contexto + token (fallback)
  const [authSnap, setAuthSnap] = useState(() => deriveSnapshot(user));

  // Actualiza snapshot cuando cambien señales relevantes
  useEffect(() => {
    setAuthSnap(deriveSnapshot(user));
  }, [user, initialized, loading]);

  // Escucha un evento personalizado opcional (emítelo después de login)
  useEffect(() => {
    const handler = () => setAuthSnap(deriveSnapshot(user));
    window.addEventListener("auth-changed", handler as any);
    // Fallback mínimo: al ganar focus, re-calcula (por si storage cambió)
    window.addEventListener("focus", handler as any);
    return () => {
      window.removeEventListener("auth-changed", handler as any);
      window.removeEventListener("focus", handler as any);
    };
  }, [user]);

  const isAdmin = authSnap.isAdmin;

  const handleToggleAdmin = () => setOpenAdmin((o) => !o);

  /* -------------------- Items -------------------- */

  const adminItems = useMemo(
    () => [
      {
        href: "/users",
        label: "Usuarios",
        Icon: UserIcon,
        active: pathname === "/users",
        adminOnly: true,
      },
      {
        href: "/groups",
        label: "Grupos",
        Icon: UserGroupIcon,
        active: pathname === "/groups",
        adminOnly: true,
      }
    ],
    [pathname]
  );

  const navigationItems = useMemo(
    () => [
      {
        href: "/dashboard",
        label: "Conversaciones",
        Icon: ChatBubbleLeftRightIcon,
        active: pathname === "/dashboard",
        adminOnly: false,
      },
      {
        href: "/sheets",
        label: "Sheets",
        Icon: DocumentCheckIcon,
        active: pathname === "/sheets",
        adminOnly: false,
      },
    ],
    [pathname]
  );

  const templateItems = useMemo(
    () => [
      {
        href: "/templates",
        label: "Ver Plantillas",
        Icon: EyeIcon,
        active: pathname === "/templates",
        adminOnly: false,
      },
      {
        href: "/templates/new",
        label: "Crear Plantilla",
        Icon: PencilSquareIcon,
        active: pathname === "/templates/new",
        adminOnly: true,
      },
    ],
    [pathname]
  );

  const filteredNavigationItems = useMemo(
    () => navigationItems.filter((i) => (isAdmin ? true : !i.adminOnly)),
    [navigationItems, isAdmin]
  );

  const filteredTemplateItems = useMemo(
    () => templateItems.filter((i) => (isAdmin ? true : !i.adminOnly)),
    [templateItems, isAdmin]
  );

  const filteredAdminItems = useMemo(
    () => adminItems.filter((i) => (isAdmin ? true : !i.adminOnly)),
    [adminItems, isAdmin]
  );
  const isAdminActive =
    pathname.startsWith("/admin") ||
    (filteredAdminItems?.some?.((i) => i.active) ?? false);

  // Colapsa administración si navegas fuera
  useEffect(() => {
    if (!isAdminActive) setOpenAdmin(false);
  }, [isAdminActive]);

  /* -------------------- Interacciones -------------------- */

  const isTemplatesActive = pathname.startsWith("/templates");

  const handleToggleTemplates = useCallback(() => {
    setOpenTemplates((prev) => !prev);
  }, []);

  const handleMobileClick = useCallback(() => {
    if (isMobile && onToggle) onToggle();
  }, [isMobile, onToggle]);

  /* -------------------- Render -------------------- */

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar; key fuerza re-mount limpio al cambiar auth */}
      <aside
        key={authSnap.stamp}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-purple-500 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${!isOpen ? "-translate-x-full" : "translate-x-0"}
          ${isMobile ? "shadow-2xl" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-700/60 shrink-0">
          <h1 className="text-xl font-bold truncate">WhatsApp Web</h1>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-purple-400/40 rounded transition-colors"
              aria-label="Cerrar sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>


        {/* Navigation */}
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          
              {/* Administración */}
              {isAdmin && filteredAdminItems?.length > 0 && (
                <div className="space-y-1">
                  <button
                    onClick={handleToggleAdmin} // ← ya no handleMobileClick
                    className={`
        flex items-center justify-between w-full px-4 py-2 rounded-md
        transition-colors duration-200 group
        ${
          isAdminActive
            ? "bg-purple-200 text-black"
            : "hover:bg-purple-300 text-gray-200"
        }
      `}
                    aria-expanded={openAdmin}
                    aria-controls="admin-panel"
                  >
                    <span className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span className="font-medium">Administración</span>
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openAdmin ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    id="admin-panel"
                    className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${openAdmin ? "max-h-28 opacity-100" : "max-h-0 opacity-0"}
      `}
                  >
                    <div className="ml-6 space-y-1 pt-1">
                      {filteredAdminItems.map((item) => (
                        <SubNavLink
                          key={item.href}
                          {...item}
                          onClick={handleMobileClick}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Plantillas */}
              <div className="space-y-1">
                <button
                  onClick={handleToggleTemplates}
                  className={`
                    flex items-center justify-between w-full px-4 py-2 rounded-md
                    transition-colors duration-200 group
                    ${
                      isTemplatesActive
                        ? "bg-purple-200 text-black"
                        : "hover:bg-purple-300 text-gray-200"
                    }
                  `}
                  aria-expanded={openTemplates}
                >
                  <span className="flex items-center space-x-3">
                    <Squares2X2Icon className="w-5 h-5" />
                    <span className="font-medium">Plantillas</span>
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openTemplates ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`
                    overflow-hidden transition-all duration-200 ease-in-out
                    ${
                      openTemplates
                        ? "max-h-28 opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  <div className="ml-6 space-y-1 pt-1">
                    {filteredTemplateItems.map((item) => (
                      <SubNavLink
                        key={item.href}
                        {...item}
                        onClick={handleMobileClick}
                      />
                    ))}
                  </div>
                </div>
              </div>

          {/* Shimmer suave mientras valida, pero sin bloquear */}
          {initialized && loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-purple-400/40 rounded" />
              ))}
            </div>
          ) : (
            <>
            {/* Navegación */}
              {filteredNavigationItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={handleMobileClick}
                />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-700/60 shrink-0 space-y-3">
          {authSnap.hasUser ? (
            <div className="text-sm text-gray-200 mb-2">
              <div className="font-medium">{authSnap.name ?? "Usuario"}</div>
              <div className="text-xs">{authSnap.email ?? "—"}</div>
              {authSnap.isAdmin && (
                <div className="text-xs text-yellow-300 font-medium">
                  👑 Admin
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-300/80">
              {initialized ? "Sesión no iniciada." : "Inicializando sesión..."}
            </div>
          )}

          <button
            onClick={() => {
              showSweetAlert({
                title: "¿Cerrar sesión?",
                text: "Esta acción no se puede deshacer",
                icon: "warning",
                confirmButtonText: "Sí, cerrar sesión",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                customClass: {
                  container: "w-full",
                  confirmButton:
                    "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded",
                  cancelButton:
                    "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded",
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  if (isMobile && onToggle) onToggle();

                  setTimeout(() => logout(), 0);
                }
              });
            }}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 w-full group shadow-md hover:shadow-lg"
          >
            <ArrowLeftCircleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Cerrar sesión</span>
          </button>

          <div className="text-xs text-gray-300/70 text-center">v1.0.0</div>
        </div>
      </aside>
    </>
  );
}

/* -------------------- Subcomponentes -------------------- */

function NavLink({ href, label, Icon, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center space-x-3 px-4 py-2 rounded-md
        transition-colors duration-200 group
        ${
          active
            ? "bg-purple-200 text-black font-medium"
            : "text-gray-200 hover:bg-purple-300 hover:text-white"
        }
      `}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span className="font-medium truncate">{label}</span>
    </Link>
  );
}

function SubNavLink({ href, label, Icon, active, onClick }: SubNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-md text-sm
        transition-colors duration-200
        ${
          active
            ? "bg-purple-200 text-black font-medium"
            : "text-gray-300 hover:bg-purple-300 hover:text-white"
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </Link>
  );
}
