"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, Menu, X, Home, Calendar, FileText, Activity, CreditCard, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Ficha Clínica", href: "/ficha", icon: FileText },
  { name: "Odontograma", href: "/odontograma", icon: Activity },
  { name: "Presupuestos", href: "/presupuestos", icon: CreditCard },
  { name: "OdontólogoIA", href: "/chat", icon: Bot },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-20 bg-background flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 border-b border-gray-200 lg:border-none">
        
        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black shadow-md pb-0.5">
            🦷
          </div>
        </div>

        {/* Profile Info (hidden on strict mobile, shown on md and lg) */}
        <div className="hidden md:flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=JanaSantander&backgroundColor=e6f7fa"
              alt="Dra. Avatar"
              className="w-full h-full object-cover p-1 bg-white"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900">
                Dra. Jana Santander
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              jana.santander@example.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Desktop Search */}
          <div className="relative group hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="pl-11 pr-4 py-2.5 rounded-full border-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 w-72 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all"
            />
          </div>
          
          {/* Mobile Search Button */}
          <button className="lg:hidden p-2 rounded-full bg-white text-gray-600 shadow-sm">
             <Search className="w-5 h-5" />
          </button>

          <button className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:scale-105 active:scale-95">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white box-content shadow-sm"></span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Un click en el fondo oscuro cierra el menú */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          <aside className="relative w-64 bg-sidebar text-gray-900 h-full flex flex-col items-start p-4 shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              className="absolute top-4 right-4 p-2 bg-white/30 rounded-full hover:bg-white/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>

            <div className="flex items-center gap-3 mb-10 px-2 w-full mt-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xl shadow-md pb-0.5">
                🦷
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Odontodrive
              </span>
            </div>
            
            <nav className="flex-1 w-full space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-bold",
                      isActive
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-gray-900" : "text-gray-600")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-auto w-full mb-4">
              <div className="flex items-center gap-3 p-3 bg-white/40 rounded-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
                  <img src="https://api.dicebear.com/9.x/notionists/svg?seed=JanaSantander&backgroundColor=e6f7fa" alt="Profile" className="w-full h-full object-cover p-1 bg-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Dra. Jana Santander</p>
                  <p className="text-[10px] text-gray-700">Ver Perfil</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
