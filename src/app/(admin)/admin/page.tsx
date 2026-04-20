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
  num_pacientes?: number;
  num_archivos?: number;
  num_presupuestos?: number;
  espacio_usado_bytes?: number;
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

  const handleUpgradePlan = async (userId: string, nuevoPlan: string) => {
    if (!confirm(`¿Deseas cambiar a este odontólogo al plan ${nuevoPlan.toUpperCase()}?`)) {
      // Revertir el select visualmente recargando
      fetchUsers();
      return;
    }
    try {
      const { error } = await authService.adminUpgradePlan(userId, nuevoPlan);
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
          <p className="text-sm text-gray-700 font-medium mt-1">
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Métricas</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-800">
                      Cargando profesionales...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-800">
                      No hay profesionales registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={`transition-colors hover:bg-gray-50/50 ${!u.activo ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{u.nombre || "Sin Nombre"}</span>
                          <span className="text-xs text-gray-700">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                           u.plan === 'premium' ? 'bg-amber-100 text-amber-700' :
                           u.plan === 'avanzado' ? 'bg-purple-100 text-purple-700' :
                           u.plan === 'estandar' ? 'bg-accent/15 text-accent' :
                           u.plan === 'basico' ? 'bg-blue-100 text-blue-700' :
                           'bg-gray-100 text-gray-800'
                        }`}>
                          {u.plan === 'premium' && <Star className="w-3 h-3 fill-current" />}
                          {u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : 'Free'}
                        </span>
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 min-w-32">
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_pacientes || 0} Pacientes
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_archivos || 0} Archivos
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_presupuestos || 0} Presupuestos
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-max">
                            {((u.espacio_usado_bytes || 0) / (1024 * 1024)).toFixed(2)} MB Usados
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!u.es_admin && (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={u.plan || 'free'}
                              onChange={(e) => handleUpgradePlan(u.id, e.target.value)}
                              className="px-2 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg focus:ring-2 focus:ring-accent outline-none cursor-pointer"
                            >
                              <option value="free">Free</option>
                              <option value="basico">Básico</option>
                              <option value="estandar">Estándar</option>
                              <option value="avanzado">Avanzado</option>
                              <option value="premium">Premium</option>
                            </select>
                            <button 
                              onClick={() => handleBanUser(u.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors border border-red-200"
                            >
                              Eliminar Permanente
                            </button>
                          </div>
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
