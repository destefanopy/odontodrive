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
  num_citas?: number;
  ultimo_login?: string;
  num_tratamientos?: number;
  num_usos_ia?: number;
  num_dientes_odontograma?: number;
  num_consentimientos?: number;
  num_tareas?: number;
  metadata?: {
    clinic_name?: string;
    clinic_phone?: string;
    clinic_logo_url?: string;
    clinic_title?: string;
    clinic_color?: string;
    phone?: string;
  };
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase">Último Acceso</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-800">
                      Cargando profesionales...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-800">
                      No hay profesionales registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={`transition-colors hover:bg-gray-50/50 ${!u.activo ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                             {u.metadata?.clinic_logo_url ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={u.metadata.clinic_logo_url} className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white shadow-sm flex-shrink-0" alt="Logo" />
                             ) : (
                               <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 font-bold border border-gray-100 flex-shrink-0">
                                 Sin Logo
                               </div>
                             )}
                             <div>
                               <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                 {u.nombre || "Sin Nombre"}
                                 {u.metadata?.clinic_color && (
                                   <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: u.metadata.clinic_color }} title="Color de clínica"></span>
                                 )}
                               </span>
                               <span className="text-xs text-gray-500 font-medium">{u.email}</span>
                             </div>
                           </div>
                           {(u.metadata?.clinic_title || u.metadata?.clinic_name || u.metadata?.clinic_phone || u.metadata?.phone) && (
                             <div className="flex flex-col text-[11px] text-gray-600 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                               {u.metadata?.clinic_title && <span><b className="text-gray-800">Título:</b> {u.metadata.clinic_title}</span>}
                               {u.metadata?.clinic_name && <span><b className="text-gray-800">Clínica:</b> {u.metadata.clinic_name}</span>}
                               {(u.metadata?.clinic_phone || u.metadata?.phone) && <span><b className="text-gray-800">Telf:</b> {u.metadata.clinic_phone || u.metadata.phone}</span>}
                             </div>
                           )}
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
                            {u.num_citas || 0} Citas
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_tratamientos || 0} Tratamientos
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-teal-50 text-teal-700 border border-teal-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_usos_ia || 0} Usos OdontólogoIA
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_dientes_odontograma || 0} Dientes Marcados
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-orange-50 text-orange-700 border border-orange-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_consentimientos || 0} Consentimientos
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-pink-50 text-pink-700 border border-pink-100 rounded-md px-2 py-0.5 w-max">
                            {u.num_tareas || 0} Tareas
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-max">
                            {((u.espacio_usado_bytes || 0) / (1024 * 1024)).toFixed(2)} MB Usados
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Nunca"}
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
