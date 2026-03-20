"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Ficha Clínica", href: "/ficha", icon: FileText },
  { name: "Odontograma", href: "/odontograma", icon: Activity },
  { name: "Presupuestos", href: "/presupuestos", icon: CreditCard },
  { name: "OdontólogoIA", href: "/chat", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar text-gray-900 h-screen flex flex-col items-start p-4 border-r border-[#31b8b3] shadow-lg z-20">
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
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-bold",
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-gray-900" : "text-gray-600")} />
              {item.name}
              {item.name === "Dashboard" && (
                <span className="ml-auto bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full mb-4">
        <div className="bg-white/40 border border-white/60 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden group shadow-sm">
          <h3 className="text-sm font-black text-gray-900 relative z-10">Premium AI</h3>
          <p className="text-xs text-gray-700 font-medium relative z-10">
            Analiza radiografías con precisión.
          </p>
          <button className="w-full relative z-10 py-2 mt-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-md">
            Mejorar Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
