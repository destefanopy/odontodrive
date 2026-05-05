"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/core/auth";
import { Shield, ShieldAlert, Star, Ban, CheckCircle, Search, RefreshCw, ArrowUp, ArrowDown, Download, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  ultima_accion?: string;
  metadata?: {
    clinic_name?: string;
    clinic_phone?: string;
    clinic_logo_url?: string;
    clinic_title?: string;
    clinic_color?: string;
    phone?: string;
    clinic_city?: string;
    clinic_country?: string;
    currency_symbol?: string;
  };
}

interface ChartData {
  date: string;
  count: number;
}

export default function AdminConsole() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [configSoporte, setConfigSoporte] = useState({ telefono: "", email: "" });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [growthData, setGrowthData] = useState<{ doctors: ChartData[], patients: ChartData[] }>({ doctors: [], patients: [] });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = tableRef.current;
      
      // Ajuste temporal para evitar que la tabla se corte en el PDF
      const originalOverflow = element.style.overflow;
      const originalWidth = element.style.width;
      const innerDiv = element.querySelector('.overflow-x-auto') as HTMLDivElement;
      const originalInnerOverflow = innerDiv ? innerDiv.style.overflow : '';
      
      element.style.overflow = 'visible';
      element.style.width = 'max-content';
      if (innerDiv) innerDiv.style.overflow = 'visible';

      const opt = {
        margin:       10,
        filename:     `Reporte_Odontodrive_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: element.scrollWidth },
        jsPDF:        { unit: 'mm', format: 'a3', orientation: 'landscape' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

      // Restaurar estilos
      element.style.overflow = originalOverflow;
      element.style.width = originalWidth;
      if (innerDiv) innerDiv.style.overflow = originalInnerOverflow;

    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

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

  const fetchConfig = async () => {
    try {
      const { data, error } = await authService.getSystemConfig();
      if (!error && data) {
        setConfigSoporte({ telefono: data.soporte_telefono || "", email: data.soporte_email || "" });
      }
    } catch (err) {}
  };

  const fetchGrowthData = async () => {
    try {
      const { data, error } = await authService.adminGetGrowthStats();
      if (!error && data) {
        let docTotal = 0;
        const docs = (data.doctors || []).map((d: any) => ({ 
          date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' }), 
          count: (docTotal += d.count) 
        }));
        
        let patTotal = 0;
        const pats = (data.patients || []).map((d: any) => ({ 
          date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' }), 
          count: (patTotal += d.count) 
        }));
        
        setGrowthData({ doctors: docs, patients: pats });
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchConfig();
    fetchGrowthData();
  }, []);

  const sortedUsers = React.useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Profile];
        let bVal: any = b[sortConfig.key as keyof Profile];

        if (sortConfig.key === 'ultimo_login' || sortConfig.key === 'created_at') {
           aVal = aVal ? new Date(aVal).getTime() : 0;
           bVal = bVal ? new Date(bVal).getTime() : 0;
        } else if (sortConfig.key === 'nombre') {
           aVal = (aVal || a.email || "").toLowerCase();
           bVal = (bVal || b.email || "").toLowerCase();
        } else {
           aVal = aVal || 0;
           bVal = bVal || 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <th 
      className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none" 
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey && (
          <span className="text-accent flex items-center">
            {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>}
          </span>
        )}
      </div>
    </th>
  );

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const { error } = await authService.updateSystemConfig(configSoporte.telefono, configSoporte.email);
      if (error) throw error;
      alert("Configuración de soporte actualizada exitosamente.");
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

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
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button 
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-accent/50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Crecimiento de Profesionales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.doctors}>
                <defs>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorDoctors)" name="Total Doctores" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Crecimiento de Pacientes (Global)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.patients}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" name="Total Pacientes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono de Soporte</label>
          <input 
            type="text" 
            value={configSoporte.telefono} 
            onChange={(e) => setConfigSoporte({ ...configSoporte, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
            placeholder="+595 962 122644"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Email de Soporte</label>
          <input 
            type="email" 
            value={configSoporte.email} 
            onChange={(e) => setConfigSoporte({ ...configSoporte, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
            placeholder="destefanopy@gmail.com"
          />
        </div>
        <button 
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSavingConfig ? "Guardando..." : "Guardar Contacto"}
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      ) : (
        <div ref={tableRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <SortableHeader label="Usuario" sortKey="nombre" />
                  <SortableHeader label="Plan" sortKey="plan" />
                  <SortableHeader label="Estado" sortKey="activo" />
                  <SortableHeader label="Rol" sortKey="es_admin" />
                  <SortableHeader label="Métricas" sortKey="num_pacientes" />
                  <SortableHeader label="Registro" sortKey="created_at" />
                  <SortableHeader label="Último Acceso" sortKey="ultimo_login" />
                  <th className="px-6 py-4 text-xs font-bold text-gray-700 tracking-wider uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-800">
                      Cargando profesionales...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-800">
                      No hay profesionales registrados aún.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((u) => (
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
                           {(u.metadata?.clinic_title || u.metadata?.clinic_name || u.metadata?.clinic_phone || u.metadata?.phone || u.metadata?.clinic_city || u.metadata?.clinic_country || u.metadata?.currency_symbol) && (
                             <div className="flex flex-col text-[11px] text-gray-600 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                               {u.metadata?.clinic_title && <span><b className="text-gray-800">Título:</b> {u.metadata.clinic_title}</span>}
                               {u.metadata?.clinic_name && <span><b className="text-gray-800">Clínica:</b> {u.metadata.clinic_name}</span>}
                               {(u.metadata?.clinic_phone || u.metadata?.phone) && <span><b className="text-gray-800">Telf:</b> {u.metadata.clinic_phone || u.metadata.phone}</span>}
                               {(u.metadata?.clinic_city || u.metadata?.clinic_country) && <span><b className="text-gray-800">Ubicación:</b> {u.metadata.clinic_city} {u.metadata.clinic_country ? `, ${u.metadata.clinic_country}` : ''}</span>}
                               {u.metadata?.currency_symbol && <span><b className="text-gray-800">Moneda:</b> {u.metadata.currency_symbol}</span>}
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
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Desconocido"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-600">
                            {u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Nunca"}
                          </span>
                          {u.ultima_accion && (
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full w-max">
                              {u.ultima_accion}
                            </span>
                          )}
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
