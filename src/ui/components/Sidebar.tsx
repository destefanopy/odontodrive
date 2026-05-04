"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Shield, Wallet, Crown, HardDrive, User, LogOut, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/infrastructure/supabase";
import { authService } from "@/core/auth";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [userData, setUserData] = useState<{name: string, email: string, avatarUrl: string | null} | null>(null);
  const router = useRouter();

  const planLimits: Record<string, number> = {
    free: 100 * 1024 * 1024,
    basico: 1024 * 1024 * 1024,
    estandar: 5120 * 1024 * 1024,
    avanzado: 20480 * 1024 * 1024,
    premium: 40960 * 1024 * 1024,
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = () => {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user && isMounted) {
          if (data.user.email === 'destefanopy@gmail.com') setIsAdmin(true);
          
          setUserData({
            name: data.user.user_metadata?.full_name || "Odontólogo(a)",
            email: data.user.email || "",
            avatarUrl: data.user.user_metadata?.avatar_url || null
          });

          supabase.from('perfiles').select('plan, storage_usado_bytes').eq('id', data.user.id).single()
            .then(({ data: perfil }) => {
              if (perfil && isMounted) {
                setUserPlan(perfil.plan || 'free');
                setStorageUsed(perfil.storage_usado_bytes || 0);
              }
            });
        }
      });
    };

    loadProfile();

    const handlePlanUpdate = () => loadProfile();
    window.addEventListener('planUpdated', handlePlanUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, []);

  const navItems = [
    { name: "Calendario", href: "/agenda", icon: Calendar },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Finanzas", href: "/finanzas", icon: Wallet },
    { name: "Configuración", href: "/cuenta", icon: Settings },
    ...(isAdmin ? [
      { name: "Admin Usuarios", href: "/admin", icon: Shield },
      { name: "Admin Documentos", href: "/admin/documentos", icon: FileText }
    ] : [])
  ];

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

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
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/40 rounded-xl shadow-sm border border-white/60">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={userData?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${userData?.name || 'Doctor'}&backgroundColor=e6f7fa`} alt="Profile" className="w-full h-full object-cover p-1 bg-white" />
          </div>
          <div className="flex-1 w-0">
            <Link href="/cuenta" className="block">
              <p className="text-xs font-bold text-gray-900 truncate hover:text-accent transition-colors">{userData ? userData.name : "Cargando..."}</p>
              <p className="text-[10px] text-gray-700 truncate hover:text-accent transition-colors">{userData ? userData.email : ""}</p>
            </Link>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
