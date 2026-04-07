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

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // En lugar de pestañas confusas, usamos modales o formularios en línea que son explícitos
  const [showForm, setShowForm] = useState<"Ninguno" | "Deuda" | "Abono">("Ninguno");
  
  const [formulario, setFormulario] = useState({
    monto: "",
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
    const montoNumerico = Number(formulario.monto);
    if (!montoNumerico || montoNumerico <= 0 || !formulario.concepto) {
      alert("Por favor, ingresa un monto válido y un concepto.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const isoDate = new Date(formulario.fechaDialog + "T12:00:00Z").toISOString();
      
      if (showForm === "Abono") {
        await createPago({
          paciente_id: paciente.id,
          monto: montoNumerico,
          metodo_pago: formulario.metodo,
          concepto: formulario.concepto,
          fecha_pago: isoDate
        });
      } else {
        await createDeuda({
          paciente_id: paciente.id,
          monto: montoNumerico,
          concepto: formulario.concepto,
          fecha: isoDate
        });
      }

      setFormulario({ monto: "", concepto: "", metodo: "Efectivo", fechaDialog: new Date().toISOString().split('T')[0] });
      setShowForm("Ninguno");
      await cargarFinanzas();
    } catch (error: any) {
      alert(`Error al registrar: ` + error.message);
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
  const saldoNeto = totalPagos - totalDeudas;

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
          {formatGs(Math.abs(saldoNeto))}
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm font-bold opacity-90">
          <span className="flex items-center gap-1.5"><ArrowUpCircle className="w-4 h-4 text-red-500" /> Total Cargos: {formatGs(totalDeudas)}</span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span className="flex items-center gap-1.5"><ArrowDownCircle className="w-4 h-4 text-emerald-500" /> Total Abonado: {formatGs(totalPagos)}</span>
        </div>
        <div className="mt-4 font-bold text-sm">
          {saldoNeto === 0 && <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">Saldo Cero (Al día)</span>}
          {saldoNeto > 0 && <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full">Tiene saldo a favor</span>}
          {saldoNeto < 0 && <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full">Debe abonar saldo pendiente</span>}
        </div>
      </div>

      {/* Botones de acción claros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => {
            setFormulario({ monto: "", concepto: "", metodo: "Efectivo", fechaDialog: new Date().toISOString().split('T')[0] });
            setShowForm(showForm === "Deuda" ? "Ninguno" : "Deuda");
          }}
          className={`flex items-center justify-center gap-2 p-5 rounded-2xl font-black transition-all ${showForm === 'Deuda' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border-2 border-red-100 text-red-700 hover:bg-red-50 hover:border-red-200'}`}
        >
          <Receipt className="w-5 h-5" />
          + Registrar Nuevo Tratamiento (Cargo)
        </button>
        
        <button 
           onClick={() => {
            setFormulario({ monto: "", concepto: "", metodo: "Efectivo", fechaDialog: new Date().toISOString().split('T')[0] });
            setShowForm(showForm === "Abono" ? "Ninguno" : "Abono");
          }}
          className={`flex items-center justify-center gap-2 p-5 rounded-2xl font-black transition-all ${showForm === 'Abono' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'}`}
        >
          <Wallet className="w-5 h-5" />
          + Recibir Dinero (Cobro)
        </button>
      </div>

      {/* Formulario Dinámico (Abono o Deuda) */}
      {showForm !== "Ninguno" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl shadow-gray-100/50">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              {showForm === "Deuda" ? <Receipt className="text-red-500 w-6 h-6" /> : <Wallet className="text-emerald-500 w-6 h-6" />}
              {showForm === "Deuda" ? "Registrar el costo de un tratamiento" : "Registrar un pago del paciente"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Concepto <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder={showForm === "Deuda" ? "Ej. Tratamiento de conducto..." : "Ej. Entrega inicial..."}
                  value={formulario.concepto}
                  onChange={e => setFormulario({...formulario, concepto: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-base font-medium transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Monto (Gs.) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="0"
                  value={formulario.monto}
                  onChange={e => setFormulario({...formulario, monto: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xl text-gray-900 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
                <input
                  type="date"
                  value={formulario.fechaDialog}
                  onChange={e => setFormulario({...formulario, fechaDialog: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-base font-medium text-gray-700 transition-all"
                />
              </div>

              {showForm === "Abono" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2 h-[50px]">
                    {["Efectivo", "Tarjeta", "Transferencia"].map(met => (
                      <button
                        key={met}
                        onClick={() => setFormulario({...formulario, metodo: met})}
                        className={`text-xs font-bold rounded-xl transition-all border ${formulario.metodo === met ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        {met}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setShowForm("Ninguno")}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleRegistrar}
                disabled={isSubmitting || !formulario.monto || !formulario.concepto}
                className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar {showForm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Movimientos */}
      <div className="bg-white border text-left border-gray-200 rounded-3xl overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">Historial de Movimientos</h3>
        </div>
        
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : deudas.length === 0 && pagos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <Receipt className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aún no hay cargos ni pagos registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {[
              ...pagos.map(p => ({ ...p, _tipo: "Abono" as const, _fecha: new Date(p.fecha_pago) })),
              ...deudas.map(d => ({ ...d, _tipo: "Deuda" as const, _fecha: new Date(d.fecha) }))
            ].sort((a, b) => b._fecha.getTime() - a._fecha.getTime())
                .map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx._tipo === 'Abono' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {tx._tipo === 'Abono' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{tx.concepto}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                      <span>{tx._fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {tx._tipo === 'Abono' && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                          {renderIconoMetodo(tx.metodo_pago)}
                          {tx.metodo_pago}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`text-lg font-black ${tx._tipo === 'Abono' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx._tipo === 'Abono' ? '+' : '-'}{formatGs(tx.monto)}
                  </span>
                  
                  <button 
                    onClick={() => deleteItem(tx.id, tx._tipo)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                    title="Eliminar movimiento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
