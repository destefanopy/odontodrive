"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Trash2, Printer, Save } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PresupuestoPDFTemplate from "./PresupuestoPDFTemplate";
import { Paciente } from "@/core/api";

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

  const printRef = useRef<HTMLDivElement>(null);

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
  const total = Math.max(0, subtotal - (Number(descuento) || 0));

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
          <p className="text-sm text-gray-700">
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
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-800 uppercase tracking-wider">
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
                  className="p-2 text-gray-800 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-800"
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
            <label className="text-sm font-bold text-gray-800">Descuento Global (Gs) en Dinero</label>
            <input
              type="number"
              value={descuento || ""}
              onChange={(e) => setDescuento(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 shadow-sm"
            />
          </div>

          <div className="w-full md:w-1/3 bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal:</span>
              <span>{formatGs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>Descuento:</span>
              <span>- {formatGs(descuento)}</span>
            </div>
            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-100">
              <span>Total a Pagar:</span>
              <span>{formatGs(total)}</span>
            </div>
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
          total={total}
        />
      </div>
    </div>
  );
}
