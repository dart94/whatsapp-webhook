"use client";
import Sidebar from "@/components/Sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const toggle = () => setIsOpen(!isOpen);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  
return (
  // 1) La página no hace scroll
  <div className="h-screen overflow-hidden bg-gray-50">
    <div className="h-full flex bg-gray-50">
      <Sidebar isOpen={isOpen} onToggle={toggle} />

      {/* 2) Contenedor en columna que SÍ permite a sus hijos encogerse */}
      <div
        className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out ${
          !isMobile ? (isOpen ? "ml-64" : "ml-0") : "ml-0"
        }`}
      >
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-30 shrink-0">
          <button
            onClick={toggle}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors mr-3"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isMobile ? "WhatsApp Web" : "Dashboard"}
          </h1>
        </header>


        {/* Main neutral: sin scroll propio, relativo para el absolute del hijo */}
        <main className="flex-1 min-h-0 relative overflow-hidden">
          {/* ESTE wrapper ocupa TODO el main */}
          <div className="absolute inset-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  </div>
);

}