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
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openTemplates, setOpenTemplates] = useState(false);

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        WhatsApp Web
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {/* Conversaciones */}
        <NavLink
          href="/"
          label="Conversaciones"
          Icon={ChatBubbleLeftRightIcon}
          active={pathname === "/"}
        />

        {/* Plantillas - con submenú */}
        <div>
          <button
            onClick={() => setOpenTemplates(!openTemplates)}
            className={`flex items-center justify-between w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors ${
              pathname.startsWith("/templates") ? "bg-green-600" : ""
            }`}
          >
            <span className="flex items-center space-x-2">
              <Squares2X2Icon className="w-5 h-5" />
              <span>Plantillas</span>
            </span>
            <ChevronDownIcon
              className={`w-5 h-5 transform transition-transform ${
                openTemplates ? "rotate-180" : ""
              }`}
            />
          </button>

          {openTemplates && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                href="/templates"
                label="Ver Plantillas"
                active={pathname === "/templates"}
                Icon={EyeIcon}
              />
              <NavLink
                href="/templates/new"
                label="Crear Plantilla"
                active={pathname === "/templates/new"}
                Icon={PencilSquareIcon}
              />
            </div>
          )}
        </div>

        {/* CRM */}
        <NavLink
          href="/crm"
          label="CRM"
          Icon={ChartBarIcon}
          active={pathname === "/crm"}
        />
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon?: any;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
        active ? "bg-green-600" : "hover:bg-gray-700"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
    </Link>
  );
}
