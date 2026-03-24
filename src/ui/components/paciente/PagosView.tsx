"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, Save } from "lucide-react";
import { Paciente, Pago, Deuda, createPago, getPagos, deletePago, createDeuda, getDeudas, deleteDeuda } from "@/core/api";

interface PagosViewProps {
  paciente: Paciente;
}

export default function PagosView({ paciente }: PagosViewProps) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modoRegistro, setModoRegistro] = useState<"Abono" | "Deuda">("Abono");
  
  const [formulario, setFormulario] = useState({
    monto: 0,
    concepto: "",
    metodo: "Efectivo",
    fechaDialog: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  });

  useEffect(() => {
    cargarFinanzas();
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
    if (formulario.monto <= 0 || !formulario.concepto) {
      alert("Por favor, ingresa un monto válido y un concepto.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure time works correctly based on local ISO parse
      const isoDate = new Date(formulario.fechaDialog + "T12:00:00Z").toISOString();
      
      if (modoRegistro === "Abono") {
        await createPago({
          paciente_id: paciente.id,
          monto: formulario.monto,
          metodo_pago: formulario.metodo,
          concepto: formulario.concepto,
          fecha_pago: isoDate
        });
      } else {
        await createDeuda({
          paciente_id: paciente.id,
          monto: formulario.monto,
          concepto: formulario.concepto,
          fecha: isoDate
        });
      }

      setFormulario({ monto: 0, concepto: "", metodo: "Efectivo", fechaDialog: new Date().toISOString().split('T')[0] });
      await cargarFinanzas();
    } catch (error: any) {
      alert(`Error al registrar ${modoRegistro.toLowerCase()}: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id: string, tipo: "Abono" | "Deuda") => {
    if (!confirm(`¿Eliminar este ${tipo.toLowerCase()}? Esta acción no se puede deshacer.`)) return;
    try {
      if (tipo === "Abono") {
        await deletePago(id);
      } else {
        await deleteDeuda(id);
      }
      await cargarFinanzas();
    } catch (error: any) {
      alert("Error eliminando: " + error.message);
    }
  };

  const formatGs = (num: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(num);

  const totalDeudas = deudas.reduce((acc, d) => acc + Number(d.monto), 0);
  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  const saldoPendiente = Math.max(0, totalDeudas - totalPagos);
  const saldoAFavor = Math.max(0, totalPagos - totalDeudas);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Estado de Cuentas</h2>
          <p className="text-sm text-gray-500">
            Administra los cargos por tratamientos y los pagos recibidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-red-700 font-bold text-sm tracking-wide uppercase">Cargos (Deuda Total)</h3>
          <p className="text-3xl font-black text-red-900 mt-2">{formatGs(totalDeudas)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-blue-700 font-bold text-sm tracking-wide uppercase">Total Abonado</h3>
          <p className="text-3xl font-black text-blue-900 mt-2">{formatGs(totalPagos)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-emerald-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            Saldo {saldoAFavor > 0 ? 'a Favor' : 'Pendiente'}
          </h3>
          <p className="text-3xl font-black text-emerald-900 mt-2">
             {saldoAFavor > 0 ? formatGs(saldoAFavor) : formatGs(saldoPendiente)}
          </p>
        </div>
      </div>

      {/* Registro */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 grid md:grid-cols-2 gap-10">
          
          <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden font-bold text-sm">
               <button 
                 onClick={() => setModoRegistro("Deuda")}
                 className={`flex-1 py-3 text-center transition-all ${modoRegistro === 'Deuda' ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'bg-white text-gray-500'}`}
               >
                 + Cargar Tratamiento (Deuda)
               </button>
               <button 
                 onClick={() => setModoRegistro("Abono")}
                 className={`flex-1 py-3 text-center transition-all ${modoRegistro === 'Abono' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'bg-white text-gray-500'}`}
               >
                 + Recibir Dinero (Abono)
               </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="date"
                value={formulario.fechaDialog}
                onChange={e => setFormulario({...formulario, fechaDialog: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-gray-700"
              />
              <input
                type="number"
                placeholder="Monto (Gs) *"
                value={formulario.monto || ""}
                onChange={e => setFormulario({...formulario, monto: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900"
              />
              <input
                type="text"
                placeholder="Concepto (Ej. Entrega inicial brackets) *"
                value={formulario.concepto}
                onChange={e => setFormulario({...formulario, concepto: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              {modoRegistro === "Abono" && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {["Efectivo", "Tarjeta", "Transferencia"].map(met => (
                    <button
                      key={met}
                      onClick={() => setFormulario({...formulario, metodo: met})}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${formulario.metodo === met ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {met}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleRegistrar}
                disabled={isSubmitting}
                className={`w-full py-4 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${modoRegistro === 'Deuda' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Registrar {modoRegistro}
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-gray-500" /> Historial Combinado
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : deudas.length === 0 && pagos.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Historial vacío.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                {/* Combinar y ordenar ambos arrays por fecha */}
                {[
                  ...pagos.map(p => ({ ...p, _tipo: "Abono" as const, _fecha: new Date(p.fecha_pago) })),
                  ...deudas.map(d => ({ ...d, _tipo: "Deuda" as const, _fecha: new Date(d.fecha) }))
                ].sort((a, b) => b._fecha.getTime() - a._fecha.getTime())
                   .map(tx => (
                  <div key={tx.id} className="flex flex-col bg-white border border-gray-100 p-3 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             {tx._tipo === 'Abono' ? <ArrowDownCircle className="w-3 h-3 text-blue-500" /> : <ArrowUpCircle className="w-3 h-3 text-red-500" />}
                             <span className={`text-sm font-black ${tx._tipo === 'Abono' ? 'text-blue-700' : 'text-red-700'}`}>
                                {tx._tipo === 'Abono' ? '+' : '-'}{formatGs(tx.monto)}
                             </span>
                          </div>
                          <span className="text-[11px] text-gray-700 font-bold mt-1 line-clamp-2 leading-tight">
                            {tx.concepto} 
                            {tx._tipo === 'Abono' && <span className="font-normal text-gray-500"> ({tx.metodo_pago})</span>}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{tx._fecha.toLocaleDateString()}</span>
                       </div>
                       <button 
                         onClick={() => deleteItem(tx.id, tx._tipo)}
                         className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
