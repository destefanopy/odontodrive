"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Menu, X, Home, Users, Calendar, LogOut, Wallet, Camera, Loader2, Settings, HardDrive, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/core/auth";
import { cn } from "@/lib/utils";
import { supabase } from "@/infrastructure/supabase";

const navItems = [
  { name: "Calendario", href: "/agenda", icon: Calendar },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Finanzas", href: "/finanzas", icon: Wallet },
  { name: "Configuración", href: "/cuenta", icon: Settings },
  { name: "Ayuda y FAQ", href: "/ayuda", icon: HelpCircle }
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{name: string, email: string, avatarUrl: string | null} | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const pathname = usePathname();
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
      authService.getUser().then(({ data: { user } }) => {
        if (user && isMounted) {
          setUserData({
            name: user.user_metadata?.full_name || "Odontólogo(a)",
            email: user.email || "",
            avatarUrl: user.user_metadata?.avatar_url || null
          });

          supabase.from('perfiles').select('plan, storage_usado_bytes').eq('id', user.id).single()
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const newUrl = await authService.updateProfile(file);
      setUserData(prev => prev ? { ...prev, avatarUrl: newUrl } : null);
    } catch (err: any) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
    <>
      <header className="h-16 lg:hidden bg-background flex items-center justify-between px-4 z-10 sticky top-0 border-b border-gray-200 shadow-sm">
        
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
                        : "text-gray-900 hover:bg-white/50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-gray-900" : "text-gray-800")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-auto w-full mb-4">
              <div className="flex items-center gap-3 p-3 bg-white/40 rounded-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userData?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${userData?.name || 'Doctor'}&backgroundColor=e6f7fa`} alt="Profile" className="w-full h-full object-cover p-1 bg-white" />
                </div>
                <div className="flex-1 w-0">
                  <Link href="/cuenta" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <p className="text-xs font-bold text-gray-900 truncate hover:text-accent transition-colors">{userData ? userData.name : "Cargando..."}</p>
                    <p className="text-[10px] text-gray-900 truncate hover:text-accent transition-colors">Ver Perfil</p>
                  </Link>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm flex-shrink-0"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

