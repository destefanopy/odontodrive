"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Plus, Trash2, Printer, Save, DollarSign, Wallet, ArrowDownCircle, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PresupuestoPDFTemplate from "./PresupuestoPDFTemplate";
import { Paciente, Pago, createPago, getPagos, deletePago } from "@/core/api";

interface PresupuestoItem {
  id: string;
  descripcion: string;
  costo: number;
}

interface PresupuestosViewProps {
  paciente: Paciente;
}

export default function PresupuestosView({ paciente }: PresupuestosViewProps) {
  const [items, setItems] = useState<PresupuestoItem[]>([
    { id: crypto.randomUUID(), descripcion: "", costo: 0 }
  ]);
  const [descuento, setDescuento] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  // Pagos State
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [nuevoPago, setNuevoPago] = useState<{ monto: number; metodo: string; concepto: string }>({
    monto: 0,
    metodo: "Efectivo",
    concepto: ""
  });

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarPagos();
  }, [paciente.id]);

  const cargarPagos = async () => {
    try {
      const data = await getPagos(paciente.id);
      setPagos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPagos(false);
    }
  };

  const handleRegistrarPago = async () => {
    if (nuevoPago.monto <= 0 || !nuevoPago.concepto) {
      alert("Por favor, ingresa un monto válido y un concepto.");
      return;
    }
    setIsPaying(true);
    try {
      await createPago({
        paciente_id: paciente.id,
        monto: nuevoPago.monto,
        metodo_pago: nuevoPago.metodo,
        concepto: nuevoPago.concepto
      });
      setNuevoPago({ monto: 0, metodo: "Efectivo", concepto: "" });
      await cargarPagos();
    } catch (error: any) {
      alert("Error al registrar pago: " + error.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleBorrarPago = async (id: string) => {
    if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return;
    try {
      await deletePago(id);
      await cargarPagos();
    } catch (error: any) {
      alert("Error eliminando pago: " + error.message);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Presupuesto_${paciente.nombres_apellidos.replace(/\s+/g, '_')}`,
  });

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), descripcion: "", costo: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PresupuestoItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.costo) || 0), 0);
  const totalPresupuesto = Math.max(0, subtotal - (Number(descuento) || 0));
  
  const totalAbonado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  const totalPendiente = Math.max(0, totalPresupuesto - totalAbonado);

  const formatGs = (num: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(num);

  const commonTreatments = [
    "Limpieza de sarro completa",
    "Restauración Pieza () oclusal",
    "Resina Estética Pieza () mesial",
    "Incrustación Pieza ()",
    "Extracción simple Pieza ()",
    "Tratamiento de conducto",
    "Ortodoncia (Cuota inicial)",
    "Implante protésico",
    "Ortodoncia Metálico Completo"
  ];

  const handleSave = () => {
    startTransition(async () => {
      // Por ahora simularemos el guardado. 
      // Al usuario: Más adelante podemos conectar este JSON directo a Supabase en la tabla presupuestos.
      await new Promise(r => setTimeout(r, 800));
      alert("Presupuesto guardado temporalmente (Simulación en UI conectada). ¡Usa Imprimir PDF!");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Cotizador Interactivo</h2>
          <p className="text-sm text-gray-500">
            Arma el presupuesto de caja, aplica descuentos y genera el documento PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : "Guardar Fila"}
          </button>
          
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-8 md:col-span-9">Tratamiento / Descripción</div>
            <div className="col-span-3 md:col-span-2 text-right">Costo (Gs)</div>
            <div className="col-span-1 text-center"></div>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center animate-in slide-in-from-left-4 duration-300">
              <div className="col-span-8 md:col-span-9 relative group">
                <input
                  type="text"
                  value={item.descripcion}
                  onChange={(e) => updateItem(item.id, "descripcion", e.target.value)}
                  placeholder="Ej. Limpieza completa..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-medium text-gray-800 shadow-sm"
                  list={`treatments-${index}`}
                />
                <datalist id={`treatments-${index}`}>
                  {commonTreatments.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div className="col-span-3 md:col-span-2">
                <input
                  type="number"
                  value={item.costo || ""}
                  onChange={(e) => updateItem(item.id, "costo", Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 text-right shadow-sm"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button 
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-2 self-start mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-dashed border-emerald-300"
          >
            <Plus className="w-4 h-4" />
            + Nueva Fila
          </button>
        </div>

        {/* Totales y Descuentos */}
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm font-bold text-gray-600">Descuento Global (Gs) en Dinero</label>
            <input
              type="number"
              value={descuento || ""}
              onChange={(e) => setDescuento(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 shadow-sm"
            />
          </div>

          <div className="w-full md:w-1/3 bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal:</span>
              <span>{formatGs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>Descuento:</span>
              <span>- {formatGs(descuento)}</span>
            </div>
            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-100">
              <span>Total Cotizado:</span>
              <span>{formatGs(totalPresupuesto)}</span>
            </div>
            {pagos.length > 0 && (
              <>
                <div className="flex justify-between text-blue-600 font-bold border-t border-gray-100 pt-2 mt-2">
                  <span>Total Abonado:</span>
                  <span>{formatGs(totalAbonado)}</span>
                </div>
                <div className="flex justify-between text-2xl text-red-500 font-black border-t border-gray-200 pt-3">
                  <span>Saldo Pendiente:</span>
                  <span>{formatGs(totalPendiente)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN PAGOS Y ABONOS */}
      <div className="mt-12 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
               <Wallet className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <h2 className="text-xl font-extrabold text-gray-900">Registro de Abonos</h2>
               <p className="text-xs text-gray-500 font-medium">Asienta los pagos realizados por el paciente.</p>
             </div>
           </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Formulario de Pago */}
          <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Nuevo Pago
            </h3>
            
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Monto (Gs) *"
                value={nuevoPago.monto || ""}
                onChange={e => setNuevoPago({...nuevoPago, monto: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
              />
              <input
                type="text"
                placeholder="Concepto (Ej. Entrega inicial ortodoncia) *"
                value={nuevoPago.concepto}
                onChange={e => setNuevoPago({...nuevoPago, concepto: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                {["Efectivo", "Tarjeta", "Transferencia"].map(met => (
                  <button
                    key={met}
                    onClick={() => setNuevoPago({...nuevoPago, metodo: met})}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${nuevoPago.metodo === met ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {met}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleRegistrarPago}
                disabled={isPaying}
                className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                Registrar Ingreso a Caja
              </button>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-blue-500" /> Últimos Movimientos
            </h3>

            {loadingPagos ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : pagos.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">No se han registrado abonos aún.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {pagos.map(pago => (
                  <div key={pago.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{formatGs(pago.monto)}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{pago.concepto} • {pago.metodo_pago}</span>
                      <span className="text-[9px] text-gray-400">{new Date(pago.fecha_pago).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleBorrarPago(pago.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Component for PDF generation */}
      <div className="hidden">
        <PresupuestoPDFTemplate
          ref={printRef}
          paciente={paciente}
          items={items}
          subtotal={subtotal}
          descuento={descuento}
          total={totalPresupuesto}
        />
      </div>
    </div>
  );
}
