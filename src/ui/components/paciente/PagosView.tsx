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
  
  // Selector de registro rápido en una sola línea
  const [tipoOperacion, setTipoOperacion] = useState<"Cargo" | "Abono">("Cargo");
  
  const [formulario, setFormulario] = useState({
    monto: "",
    concepto: "",
    metodo: "Efectivo",
    fechaDialog: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
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
    const montoNumerico = Number(formulario.monto);
    if (!montoNumerico || montoNumerico <= 0 || !formulario.concepto) {
      alert("Por favor, ingresa un monto válido y un concepto.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const isoDate = new Date(formulario.fechaDialog + "T12:00:00Z").toISOString();
      
      if (tipoOperacion === "Abono") {
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

  const formatCurrency = (num: number) => `${currencySymbol} ${num.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;

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

      {/* Quick Entry Form (Una sola línea) */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          {tipoOperacion === "Cargo" ? <Receipt className="w-4 h-4 text-red-500" /> : <Wallet className="w-4 h-4 text-emerald-500" />}
          Registro Rápido
        </h3>
        
        <div className="flex flex-col xl:flex-row items-center gap-3 w-full">
          {/* Toggle Cargo/Abono */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full xl:w-auto shrink-0">
            <button
              onClick={() => setTipoOperacion("Cargo")}
              className={`flex-1 xl:flex-none px-5 py-3 rounded-xl text-sm font-bold transition-all ${tipoOperacion === "Cargo" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Cargo
            </button>
            <button
              onClick={() => setTipoOperacion("Abono")}
              className={`flex-1 xl:flex-none px-5 py-3 rounded-xl text-sm font-bold transition-all ${tipoOperacion === "Abono" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Abono
            </button>
          </div>

          <div className="w-full relative flex-1">
            <input
              type="text"
              placeholder={tipoOperacion === "Cargo" ? "Concepto (Ej. Extracción)" : "Concepto (Ej. Adelanto efectivo)"}
              value={formulario.concepto}
              onChange={e => setFormulario({...formulario, concepto: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none text-sm font-bold transition-all"
            />
          </div>
          
          <div className="w-full xl:w-52 relative shrink-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Gs.</span>
            <input
              type="number"
              placeholder="0"
              value={formulario.monto}
              onChange={e => setFormulario({...formulario, monto: e.target.value})}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none font-black text-gray-900 transition-all text-sm"
            />
          </div>

          {tipoOperacion === "Abono" && (
            <div className="w-full xl:w-40 shrink-0">
              <select
                value={formulario.metodo}
                onChange={e => setFormulario({...formulario, metodo: e.target.value})}
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="Efectivo">Efectivo 💵</option>
                <option value="Tarjeta">Tarjeta 💳</option>
                <option value="Transferencia">Banco 🏦</option>
              </select>
            </div>
          )}

          <button
            onClick={handleRegistrar}
            disabled={isSubmitting || !formulario.monto || !formulario.concepto}
            className="w-full xl:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-md"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Guardar
          </button>
        </div>
      </div>

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
                    {tx._tipo === 'Abono' ? '+' : '-'}{formatCurrency(tx.monto)}
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
