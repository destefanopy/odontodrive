"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/core/auth";
import { Shield, ShieldAlert, Star, Ban, CheckCircle, Search, RefreshCw } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  nombre: string;
  plan: string;
  activo: boolean;
  es_admin: boolean;
  created_at: string;
}

export default function AdminConsole() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await authService.adminGetAllUsers();
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios. ¿Aseguraste iniciar sesión como admin?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpgradePlan = async (userId: string) => {
    if (!confirm("¿Deseas ascender a este odontólogo al plan Premium?")) return;
    try {
      const { error } = await authService.adminUpgradePlan(userId, "premium");
      if (error) throw error;
      // Refrescar
      fetchUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleBanUser = async (userId: string) => {
    const word = window.prompt("⚠️ ADVERTENCIA ROJA: Se ELIMINARÁ PERMANENTEMENTE toda la cuenta de este profesional junto con toda su agenda, presupuestos y cientos de pacientes. Esta acción es IRREVERSIBLE.\n\nEscribe la palabra 'eliminar' en minúsculas para confirmar:");
    
    if (word !== "eliminar") {
      if (word !== null) alert("Operación cancelada: La palabra de seguridad fue incorrecta.");
      return;
    }

    try {
      const { error } = await authService.adminBanUser(userId);
      if (error) throw error;
      // Refrescar
      fetchUsers();
    } catch (err: any) {
      alert("Error eliminando de base de datos: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            Consola Administrativa
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gestión de Odontólogos, Suscripciones y Seguridad.
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-accent/50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Cargando profesionales...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No hay profesionales registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={`transition-colors hover:bg-gray-50/50 ${!u.activo ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{u.nombre || "Sin Nombre"}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.plan === 'premium' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent/15 text-[#24a09c]">
                            <Star className="w-3 h-3 fill-current" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Básico
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <Ban className="w-3 h-3" />
                            Suspendido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {u.es_admin ? "Administrador" : "Odontólogo"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!u.es_admin && (
                          <>
                            {u.plan !== 'premium' && (
                              <button 
                                onClick={() => handleUpgradePlan(u.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-[#24a09c] text-xs font-bold rounded-lg transition-colors border border-accent/20"
                              >
                                Dar Premium
                              </button>
                            )}
                            <button 
                              onClick={() => handleBanUser(u.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors border border-red-200"
                            >
                              Eliminar Permanente
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
