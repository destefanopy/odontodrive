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
    <aside className="w-64 bg-sidebar text-foreground h-screen flex flex-col items-start p-4 border-r border-[#2C2C2E] shadow-2xl z-20">
      <div className="flex items-center gap-3 mb-10 px-2 w-full mt-2">
        <div className="w-8 h-8 rounded-lg bg-accent text-sidebar flex items-center justify-center font-black text-xl shadow-lg shadow-accent/20">
          O
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
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
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
                isActive
                  ? "bg-white text-sidebar shadow-sm"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar" : "text-gray-400")} />
              {item.name}
              {item.name === "Dashboard" && (
                <span className="ml-auto bg-accent text-sidebar text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full mb-4">
        <div className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/30 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-bold text-accent relative z-10">Premium AI</h3>
          <p className="text-xs text-gray-300 relative z-10">
            Analiza radiografías con precisión.
          </p>
          <button className="w-full relative z-10 py-2 mt-2 bg-sidebar border border-gray-700 text-white rounded-full text-xs font-bold hover:bg-white hover:text-sidebar transition-all duration-300 shadow-md">
            Mejorar Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
