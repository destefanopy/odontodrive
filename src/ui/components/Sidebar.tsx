"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Shield, Wallet, Crown, HardDrive, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/infrastructure/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [storageUsed, setStorageUsed] = useState<number>(0);

  const planLimits: Record<string, number> = {
    free: 100 * 1024 * 1024,
    basico: 1024 * 1024 * 1024,
    estandar: 5120 * 1024 * 1024,
    avanzado: 20480 * 1024 * 1024,
    premium: 40960 * 1024 * 1024,
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        if (data.user.email === 'destefanopy@gmail.com') setIsAdmin(true);
        // Fetch perfil
        supabase.from('perfiles').select('plan, storage_usado_bytes').eq('id', data.user.id).single()
          .then(({ data: perfil }) => {
            if (perfil) {
              setUserPlan(perfil.plan || 'free');
              setStorageUsed(perfil.storage_usado_bytes || 0);
            }
          });
      }
    });
  }, []);

  const navItems = [
    { name: "Calendario", href: "/agenda", icon: Calendar },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Finanzas", href: "/finanzas", icon: Wallet },
    { name: "Suscripción", href: "/suscripcion", icon: Crown },
    { name: "Mi Cuenta", href: "/cuenta", icon: User },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : [])
  ];

  const limitBytes = planLimits[userPlan] || planLimits.free;
  const percentage = Math.min(100, Math.round((storageUsed / limitBytes) * 100));
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <aside className="hidden lg:flex w-64 bg-sidebar text-gray-900 h-screen flex-col items-start p-4 border-r border-[#31b8b3] shadow-lg z-20">
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
              <item.icon className={cn("w-5 h-5", isActive ? "text-gray-900" : "text-gray-800")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full mb-4">
        <div className="bg-white/60 border border-white/80 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden group shadow-sm flex flex-col items-center">
          <HardDrive className="w-6 h-6 text-accent mb-1" />
          <h3 className="text-sm font-black text-gray-900 capitalize">Plan {userPlan}</h3>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
            <div 
              className={cn("h-2 rounded-full transition-all duration-1000", percentage > 85 ? "bg-red-500" : "bg-accent")} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <p className="text-[10px] text-gray-700 font-bold w-full flex justify-between">
            <span>{formatBytes(storageUsed)}</span>
            <span>{formatBytes(limitBytes)}</span>
          </p>
          
          <Link href="/suscripcion" className="w-full block py-2 mt-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-all duration-300 shadow-md">
            Mejorar Plan
          </Link>
        </div>
      </div>
    </aside>
  );
}
