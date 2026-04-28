"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Loader2, Save, Wallet, Receipt, CreditCard, Banknote, Landmark } from "lucide-react";
import { Paciente, Pago, Deuda, createPago, getPagos, deletePago, createDeuda, getDeudas, deleteDeuda } from "@/core/api";

interface PagosViewProps {
  paciente: Paciente;
}

export default function PagosView({ paciente }: PagosViewProps) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("Gs.");

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formulario, setFormulario] = useState({
    concepto: "",
    costo: "",
    entrega: "",
    metodo: "Efectivo",
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarFinanzas();
    import("@/infrastructure/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.currency_symbol) {
          setCurrencySymbol(user.user_metadata.currency_symbol);
        }
      });
    });
  }, [paciente.id]);

  const cargarFinanzas = async () => {
    setLoading(true);
    try {
      const [pData, dData] = await Promise.all([
        getPagos(paciente.id),
        getDeudas(paciente.id)
      ]);
      setPagos(pData);
      setDeudas(dData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    const costoNumerico = Number(formulario.costo) || 0;
    const entregaNumerica = Number(formulario.entrega) || 0;
    
    if (!formulario.concepto || (costoNumerico === 0 && entregaNumerica === 0)) {
      alert("Por favor, ingresa un concepto y al menos un monto (costo o entrega).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const isoDate = new Date(formulario.fecha || new Date()).toISOString();
      
      const operaciones = [];
      if (costoNumerico > 0) {
        operaciones.push(
          createDeuda({
            paciente_id: paciente.id,
            monto: costoNumerico,
            concepto: formulario.concepto,
            fecha: isoDate
          })
        );
      }
      
      if (entregaNumerica > 0) {
        operaciones.push(
          createPago({
            paciente_id: paciente.id,
            monto: entregaNumerica,
            metodo_pago: formulario.metodo,
            concepto: formulario.concepto,
            fecha_pago: isoDate
          })
        );
      }

      await Promise.all(operaciones);

      setFormulario({ concepto: "", costo: "", entrega: "", metodo: "Efectivo", fecha: new Date().toISOString().split('T')[0] });
      await cargarFinanzas();
    } catch (error: any) {
      alert(`Error al registrar: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (deudaId: string | null, pagoId: string | null) => {
    if (!confirm(`¿Eliminar este registro del historial? Esta acción no se puede deshacer.`)) return;
    try {
      if (deudaId) await deleteDeuda(deudaId);
      if (pagoId) await deletePago(pagoId);
      await cargarFinanzas();
    } catch (error: any) {
      alert("Error eliminando: " + error.message);
    }
  };

  const formatCurrency = (num: number) => `${currencySymbol} ${num.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;

  const totalDeudas = deudas.reduce((acc, d) => acc + Number(d.monto), 0);
  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  const saldoNeto = totalPagos - totalDeudas;

  // Lógica de Agrupación de libro diario
  const mergedEntries = new Map<string, any>();
  deudas.forEach(d => {
    const fechaStr = new Date(d.fecha).toLocaleDateString();
    const key = `${d.concepto}_${fechaStr}`;
    if (!mergedEntries.has(key)) {
      mergedEntries.set(key, { key, concepto: d.concepto, fecha: new Date(d.fecha), deuda: 0, abono: 0, deudaId: d.id, pagoId: null, metodo_pago: null });
    }
    mergedEntries.get(key).deuda += Number(d.monto);
  });
  pagos.forEach(p => {
    const fechaStr = new Date(p.fecha_pago).toLocaleDateString();
    const key = `${p.concepto}_${fechaStr}`;
    if (!mergedEntries.has(key)) {
      mergedEntries.set(key, { key, concepto: p.concepto, fecha: new Date(p.fecha_pago), deuda: 0, abono: 0, pagoId: p.id, deudaId: null, metodo_pago: p.metodo_pago });
    } else {
      mergedEntries.get(key).pagoId = p.id;
      mergedEntries.get(key).metodo_pago = p.metodo_pago;
    }
    mergedEntries.get(key).abono += Number(p.monto);
  });
  const timeline = Array.from(mergedEntries.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  // Render icons para método de pago
  const renderIconoMetodo = (metodo: string) => {
    switch(metodo) {
      case 'Tarjeta': return <CreditCard className="w-3 h-3 flex-shrink-0" />;
      case 'Transferencia': return <Landmark className="w-3 h-3 flex-shrink-0" />;
      default: return <Banknote className="w-3 h-3 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Estado de Cuentas</h2>
          <p className="text-sm text-gray-500 font-medium">
            Historial de tratamientos y pagos realizados por el paciente.
          </p>
        </div>
      </div>

      {/* Saldo Global Simple */}
      <div className={`p-8 rounded-3xl border-2 text-center transition-all ${saldoNeto >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
        <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Saldo Actual del Paciente</p>
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
          {formatCurrency(Math.abs(saldoNeto))}
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm font-bold opacity-90">
          <span className="flex items-center gap-1.5"><ArrowUpCircle className="w-4 h-4 text-red-500" /> Total Cargos: {formatCurrency(totalDeudas)}</span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span className="flex items-center gap-1.5"><ArrowDownCircle className="w-4 h-4 text-emerald-500" /> Total Abonado: {formatCurrency(totalPagos)}</span>
        </div>
        <div className="mt-4 font-bold text-sm">
          {saldoNeto === 0 && <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">Saldo Cero (Al día)</span>}
          {saldoNeto > 0 && <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full">Tiene saldo a favor</span>}
          {saldoNeto < 0 && <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full">Debe abonar saldo pendiente</span>}
        </div>
      </div>

      {/* Quick Entry Form (Una sola línea - Doble Entrada) */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-gray-600" />
          Registrar Operación (Libro Diario)
        </h3>
        
        <div className="flex flex-col xl:flex-row items-center gap-3 w-full">
          <div className="flex flex-col sm:flex-row gap-3 w-full flex-[2] shrink-0 xl:shrink">
            <input
              type="date"
              value={formulario.fecha}
              onChange={e => setFormulario({...formulario, fecha: e.target.value})}
              className="w-full sm:w-36 px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none text-sm font-bold transition-all text-gray-700"
            />
            <input
              type="text"
              placeholder="Tratamiento o Concepto..."
              value={formulario.concepto}
              onChange={e => setFormulario({...formulario, concepto: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none text-sm font-bold transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full flex-[3]">
            <div className="w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-xs uppercase tracking-wider">Costo</span>
              <input
                type="number"
                placeholder="0"
                value={formulario.costo}
                onChange={e => setFormulario({...formulario, costo: e.target.value})}
                className="w-full pl-[4.5rem] pr-4 py-4 rounded-2xl bg-red-50/50 border border-transparent focus:border-red-100 focus:bg-red-50 focus:ring-2 focus:ring-red-100 outline-none font-black text-gray-900 transition-all text-sm placeholder:text-red-300"
              />
            </div>
            
            <div className="w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs uppercase tracking-wider">Abono</span>
              <input
                type="number"
                placeholder="0"
                value={formulario.entrega}
                onChange={e => setFormulario({...formulario, entrega: e.target.value})}
                className="w-full pl-[4.5rem] pr-4 py-4 rounded-2xl bg-emerald-50/50 border border-transparent focus:border-emerald-100 focus:bg-emerald-50 focus:ring-2 focus:ring-emerald-100 outline-none font-black text-gray-900 transition-all text-sm placeholder:text-emerald-300"
              />
            </div>

            <div className="w-full sm:w-32 shrink-0">
              <select
                value={formulario.metodo}
                onChange={e => setFormulario({...formulario, metodo: e.target.value})}
                className="w-full px-3 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none text-xs font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Banco</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRegistrar}
            disabled={isSubmitting || !formulario.concepto || (!formulario.costo && !formulario.entrega)}
            className="w-full xl:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-md"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div className="bg-white border text-left border-gray-200 rounded-3xl overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Historial de Movimientos</h3>
        </div>
        
        {/* Cabeceras de la Tabla (Escritorio) */}
        {!loading && timeline.length > 0 && (
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-bold text-xs text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
            <div className="col-span-6">Tratamiento / Concepto</div>
            <div className="col-span-3 text-right">Costo</div>
            <div className="col-span-3 text-right md:pr-14">Abono</div>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : timeline.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <Receipt className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aún no hay transacciones registradas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {timeline.map(tx => (
              <div key={tx.key} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center p-5 md:pl-6 hover:bg-gray-50 transition-colors group relative">
                
                <div className="col-span-6 flex items-center gap-4 w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.deuda > 0 && tx.abono > 0 ? 'bg-indigo-100 text-indigo-600' : tx.abono > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.deuda > 0 && tx.abono > 0 ? <Receipt className="w-5 h-5" /> : tx.abono > 0 ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 pr-8 md:pr-0">
                    <h4 className="font-bold text-gray-900 break-words">{tx.concepto}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                      <span>{tx.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {tx.metodo_pago && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                          {renderIconoMetodo(tx.metodo_pago)}
                          {tx.metodo_pago}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-3 flex justify-between md:block w-full md:w-auto text-right md:-ml-2">
                  <span className="md:hidden text-gray-400 font-bold text-xs uppercase tracking-wider">Costo:</span>
                  <span className={`text-base font-black ${tx.deuda > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                    {tx.deuda > 0 ? formatCurrency(tx.deuda) : '-'}
                  </span>
                </div>
                
                <div className="col-span-3 flex justify-between md:block w-full md:w-auto text-right md:pr-14">
                  <span className="md:hidden text-gray-400 font-bold text-xs uppercase tracking-wider">Abono:</span>
                  <span className={`text-base font-black ${tx.abono > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {tx.abono > 0 ? `+${formatCurrency(tx.abono)}` : '-'}
                  </span>
                </div>
                
                <button 
                  onClick={() => deleteItem(tx.deudaId, tx.pagoId)}
                  className="absolute right-4 top-5 md:top-1/2 md:-translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                  title="Eliminar este asiento contable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
