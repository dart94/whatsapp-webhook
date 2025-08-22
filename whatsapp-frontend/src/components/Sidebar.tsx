"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ChartBarIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  EyeIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ArrowLeftCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { showSweetAlert } from "./common/Sweet";

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

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openTemplates, setOpenTemplates] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout,user } = useAuth();

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar submenús cuando cambie la ruta
  useEffect(() => {
    if (!pathname.startsWith("/templates")) {
      setOpenTemplates(false);
    }
  }, [pathname]);

  const navigationItems = [
    // Usuarios - Solo para administradores
    {
      href: "/users",
      label: "Usuarios",
      Icon: UserGroupIcon,
      active: pathname === "/users",
      adminOnly: true, // Marcar como solo para admin
    },
    {
      href: "/dashboard",
      label: "Conversaciones",
      Icon: ChatBubbleLeftRightIcon,
      active: pathname === "/dashboard",
      adminOnly: false, // Disponible para todos
    },
    {
      href: "/sheets",
      label: "Sheets",
      Icon: DocumentCheckIcon,
      active: pathname === "/sheets",
      adminOnly: false, // Disponible para todos
    },
  ];

  const templateItems = [
    {
      href: "/templates",
      label: "Ver Plantillas",
      Icon: EyeIcon,
      active: pathname === "/templates",
      adminOnly: false, // Disponible para todos
    },
    {
      href: "/templates/new",
      label: "Crear Plantilla",
      Icon: PencilSquareIcon,
      active: pathname === "/templates/new",
      adminOnly: true, // Solo para admin
    },
  ];

  const isTemplatesActive = pathname.startsWith("/templates");

  // Filtrar elementos basado en isAdmin
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.adminOnly) {
      return user?.isAdmin === true;
    }
    return true; // Mostrar elementos que no son adminOnly
  });

  const filteredTemplateItems = templateItems.filter(item => {
    if (item.adminOnly) {
      return user?.isAdmin === true;
    }
    return true;
  });

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-purple-500 text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${!isOpen ? "-translate-x-full" : "translate-x-0"}
        ${isMobile ? "shadow-2xl" : ""}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
          <h1 className="text-xl font-bold truncate">WhatsApp Web</h1>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Cerrar sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation (único scroll dentro del sidebar) */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              onClick={isMobile ? onToggle : undefined}
            />
          ))}

          <div className="space-y-1">
            <button
              onClick={() => setOpenTemplates(!openTemplates)}
              className={`
              flex items-center justify-between w-full px-4 py-2 rounded-md 
              transition-colors duration-200 group
              ${
                isTemplatesActive
                  ? "bg-purple-200 text-black"
                  : "hover:bg-purple-300 text-gray-300"
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
              ${openTemplates ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}
            `}
            >
              <div className="ml-6 space-y-1 pt-1">
                {templateItems.map((item) => (
                  <SubNavLink
                    key={item.href}
                    {...item}
                    onClick={isMobile ? onToggle : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 shrink-0 space-y-3">
          <button
            onClick={() => {
              showSweetAlert({
                title: "¿Estás seguro de que deseas cerrar sesión?",
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
                  logout();
                  if (isMobile && onToggle) onToggle();
                }
              });
            }}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 w-full group shadow-md hover:shadow-lg"
          >
            <ArrowLeftCircleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
          <div className="text-xs text-gray-400 text-center">v1.0.0</div>
        </div>
      </aside>
    </>
  );
}

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
            ? "bg-purple-200 text-black semifont-medium"
            : "text-gray-300 hover:bg-purple-300 hover:text-white"
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
            ? "bg-purple-200 text-black semifont-medium"
            : "text-gray-400 hover:bg-purple-300 hover:text-white"
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </Link>
  );
}