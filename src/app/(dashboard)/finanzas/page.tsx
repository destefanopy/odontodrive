"use client";

import { useEffect, useState } from "react";
import { getPagos, getDeudas, Pago, Deuda } from "@/core/api";
import { Wallet, TrendingUp, Calendar, CreditCard, Loader2, ArrowUpCircle, ArrowDownCircle, PiggyBank, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanzasPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("Gs.");
  
  // Filtros
  const [periodo, setPeriodo] = useState<"este_mes" | "mes_pasado" | "historico" | "personalizado">("este_mes");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pacienteId, setPacienteId] = useState<string>("todos");

  useEffect(() => {
    cargarFinanzas();
    import("@/infrastructure/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.currency_symbol) {
          setCurrencySymbol(user.user_metadata.currency_symbol);
        }
      });
    });
  }, []);

  const cargarFinanzas = async () => {
    try {
      const [pData, dData] = await Promise.all([
        getPagos(),
        getDeudas()
      ]);
      setPagos(pData);
      setDeudas(dData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return `${currencySymbol} ${num.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;
  };

  const ahora = new Date();
  
  const filtarPorPeriodoYPaciente = (fechaIso: string, pId: string) => {
    // 1. Filtrar Paciente
    if (pacienteId !== "todos" && pId !== pacienteId) return false;

    // 2. Filtrar Temporalidad
    if (periodo === "historico") return true;
    
    const d = new Date(fechaIso);
    if (periodo === "este_mes") {
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    }
    if (periodo === "mes_pasado") {
      let mesAnterior = ahora.getMonth() - 1;
      let año = ahora.getFullYear();
      if (mesAnterior < 0) { mesAnterior = 11; año--; }
      return d.getMonth() === mesAnterior && d.getFullYear() === año;
    }
    if (periodo === "personalizado") {
      const t = d.getTime();
      let pasaDesde = true;
      let pasaHasta = true;
      if (fechaDesde) {
        const start = new Date(fechaDesde + "T00:00:00").getTime();
        if (t < start) pasaDesde = false;
      }
      if (fechaHasta) {
        const end = new Date(fechaHasta + "T23:59:59").getTime();
        if (t > end) pasaHasta = false;
      }
      return pasaDesde && pasaHasta;
    }
    
    return true;
  };

  const pagosFiltrados = pagos.filter(p => filtarPorPeriodoYPaciente(p.fecha_pago, p.paciente_id));
  const deudasFiltradas = deudas.filter(d => filtarPorPeriodoYPaciente(d.fecha, d.paciente_id));

  const ingresos = pagosFiltrados.reduce((acc, p) => acc + Number(p.monto), 0);
  const produccion = deudasFiltradas.reduce((acc, d) => acc + Number(d.monto), 0);
  const porCobrar = Math.max(0, produccion - ingresos);

  // Lista de pacientes únicos para el select
  const pacientesMap = new Map<string, { id: string, nombre: string }>();
  pagos.forEach(p => {
    if (p.paciente_id && p.pacientes) pacientesMap.set(p.paciente_id, { id: p.paciente_id, nombre: p.pacientes.nombres_apellidos });
  });
  deudas.forEach(d => {
    if (d.paciente_id && d.pacientes) pacientesMap.set(d.paciente_id, { id: d.paciente_id, nombre: d.pacientes.nombres_apellidos });
  });
  const pacientesOptions = Array.from(pacientesMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Lógica de Vaciado de Libro Diario (Misma fila)
  const mergedEntries = new Map<string, any>();
  
  deudasFiltradas.forEach(d => {
    const fechaStr = new Date(d.fecha).toLocaleDateString();
    const key = `${d.concepto}_${d.paciente_id}_${fechaStr}`;
    if (!mergedEntries.has(key)) {
      mergedEntries.set(key, { key, concepto: d.concepto, paciente_nombre: d.pacientes?.nombres_apellidos, fecha: new Date(d.fecha), deuda: 0, abono: 0, metodo_pago: null });
    }
    mergedEntries.get(key).deuda += Number(d.monto);
  });
  
  pagosFiltrados.forEach(p => {
    const fechaStr = new Date(p.fecha_pago).toLocaleDateString();
    const key = `${p.concepto}_${p.paciente_id}_${fechaStr}`;
    if (!mergedEntries.has(key)) {
      mergedEntries.set(key, { key, concepto: p.concepto, paciente_nombre: p.pacientes?.nombres_apellidos, fecha: new Date(p.fecha_pago), deuda: 0, abono: 0, metodo_pago: p.metodo_pago });
    } else {
      mergedEntries.get(key).metodo_pago = p.metodo_pago;
    }
    mergedEntries.get(key).abono += Number(p.monto);
  });

  const timeline = Array.from(mergedEntries.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-500" /> Cierre de Caja
            </h1>
            <p className="text-gray-700 font-medium mt-1">
              Métricas de ingresos efectivos, producción y saldos por cobrar.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de Paciente */}
            <select 
              value={pacienteId} 
              onChange={(e) => setPacienteId(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-sm font-bold py-3 px-4 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer w-full sm:w-auto"
            >
              <option value="todos">👤 Todos los Pacientes</option>
              {pacientesOptions.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            {/* Filtro de Tiempo */}
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="bg-white border border-gray-200 text-gray-900 text-sm font-bold py-3 px-4 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer w-full sm:w-auto"
            >
              <option value="este_mes">📅 Este mes</option>
              <option value="mes_pasado">⏳ Mes anterior</option>
              <option value="historico">📚 Todo el Historial</option>
              <option value="personalizado">⚙️ Personalizado</option>
            </select>
          </div>
        </div>

        {/* Inputs Personalizados (Ocultos por defecto) */}
        {periodo === "personalizado" && (
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 w-full md:w-fit self-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Desde:</span>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)} 
                className="px-3 py-2 text-sm rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Hasta:</span>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)} 
                className="px-3 py-2 text-sm rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative">
            <h3 className="text-emerald-700 font-bold text-xs tracking-wide uppercase">Ingresos Reales</h3>
            <p className="text-4xl font-black text-emerald-900 mt-2">{formatCurrency(ingresos)}</p>
            <p className="text-[10px] text-emerald-600 mt-2 font-black uppercase tracking-widest">
              Plata en Caja
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-gray-900" />
          </div>
          <div className="relative">
            <h3 className="text-gray-700 font-bold text-xs tracking-wide uppercase">Producción</h3>
            <p className="text-4xl font-black text-gray-900 mt-2">{formatCurrency(produccion)}</p>
            <p className="text-[10px] text-gray-800 mt-2 font-black uppercase tracking-widest">
              Total Tratamientos
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-24 h-24 text-red-600" />
          </div>
          <div className="relative">
            <h3 className="text-red-700 font-bold text-xs tracking-wide uppercase">Por Cobrar</h3>
            <p className="text-4xl font-black text-red-900 mt-2">{formatCurrency(porCobrar)}</p>
            <p className="text-[10px] text-red-500 mt-2 font-black uppercase tracking-widest">
              Saldo Abierto
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border text-left border-gray-200 rounded-3xl overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-gray-900">Asientos Registrados</h2>
        </div>
        
        {!loading && timeline.length > 0 && (
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-bold text-xs text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
            <div className="col-span-2">Fecha</div>
            <div className="col-span-3">Paciente</div>
            <div className="col-span-3">Concepto</div>
            <div className="col-span-2 text-right">Costo</div>
            <div className="col-span-2 text-right md:pr-4">Abono</div>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : timeline.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <Wallet className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No hay registros financieros para esta búsqueda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {timeline.map(tx => (
              <div key={tx.key} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center p-5 md:pl-6 hover:bg-gray-50 transition-colors">
                
                <div className="col-span-2 text-sm font-bold text-gray-900 border-b md:border-0 pb-2 md:pb-0 mb-2 md:mb-0">
                   {tx.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                
                <div className="col-span-3 text-sm font-bold text-gray-700 truncate">
                   {tx.paciente_nombre || "Desconocido"}
                </div>
                
                <div className="col-span-3 text-sm font-bold text-gray-900 truncate">
                   {tx.concepto} 
                   {tx.metodo_pago && (
                     <span className="md:block hidden w-fit mt-1 bg-gray-100 px-2 py-0.5 rounded-md text-[10px] text-gray-600 font-medium">
                       {tx.metodo_pago}
                     </span>
                   )}
                </div>
                
                <div className="col-span-2 flex justify-between md:block w-full md:w-auto text-right">
                  <span className="md:hidden text-gray-400 font-bold text-xs uppercase tracking-wider">Costo:</span>
                  <span className={`text-base font-black ${tx.deuda > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                    {tx.deuda > 0 ? formatCurrency(tx.deuda) : '-'}
                  </span>
                </div>
                
                <div className="col-span-2 flex justify-between md:block w-full md:w-auto text-right md:pr-4">
                  <span className="md:hidden text-gray-400 font-bold text-xs uppercase tracking-wider">Abono:</span>
                  <span className={`text-base font-black ${tx.abono > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {tx.abono > 0 ? `+${formatCurrency(tx.abono)}` : '-'}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
