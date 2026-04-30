"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import FichaImprimible from "./FichaImprimible";
import { Paciente, AntecedentesMedicos, getPagos, getDeudas } from "@/core/api";
import { MovimientoFinanciero } from "./FichaImprimible";

interface ExportarFichaBotonProps {
  paciente: Paciente;
  antecedentes?: AntecedentesMedicos | null;
  initialOdontograma: Record<number, any>;
  finalOdontograma: Record<number, any>;
}

export default function ExportarFichaBoton({
  paciente,
  antecedentes,
  initialOdontograma,
  finalOdontograma,
}: ExportarFichaBotonProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [timeline, setTimeline] = useState<MovimientoFinanciero[]>([]);

  const handleExport = async () => {
    if (!componentRef.current) return;
    setIsExporting(true);

    try {
      // 1. Obtener datos financieros
      const [pData, dData] = await Promise.all([
        getPagos(paciente.id),
        getDeudas(paciente.id)
      ]);

      const mergedEntries = new Map<string, any>();
      dData.forEach(d => {
        const fechaStr = new Date(d.fecha).toLocaleDateString();
        const key = `${d.concepto}_${fechaStr}`;
        if (!mergedEntries.has(key)) {
          mergedEntries.set(key, { key, concepto: d.concepto, fecha: new Date(d.fecha), deuda: 0, abono: 0 });
        }
        mergedEntries.get(key).deuda += Number(d.monto);
      });
      pData.forEach(p => {
        const fechaStr = new Date(p.fecha_pago).toLocaleDateString();
        const key = `${p.concepto}_${fechaStr}`;
        if (!mergedEntries.has(key)) {
          mergedEntries.set(key, { key, concepto: p.concepto, fecha: new Date(p.fecha_pago), deuda: 0, abono: 0 });
        }
        mergedEntries.get(key).abono += Number(p.monto);
      });
      
      const newTimeline = Array.from(mergedEntries.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      setTimeline(newTimeline);

      // 2. Esperar a que React renderice el componente con el timeline
      await new Promise(r => setTimeout(r, 500));

      // 3. Exportar PDF
      const html2pdf = (await import("html2pdf.js")).default;
      const element = componentRef.current;

      const opt = {
        margin:       10,
        filename:     `Ficha_${paciente.nombres_apellidos.replace(/\s+/g, "_")}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-4 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl border border-gray-200 shadow-sm text-sm hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
        title="Exportar a PDF"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span className="inline-block sm:inline">{isExporting ? "Generando..." : "Exportar Ficha"}</span>
      </button>

      {/* Componente oculto que se usará sólo para generar el PDF */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "794px" }}>
        <FichaImprimible
          ref={componentRef}
          paciente={paciente}
          antecedentes={antecedentes}
          initialOdontograma={initialOdontograma}
          finalOdontograma={finalOdontograma}
          timeline={timeline}
        />
      </div>
    </>
  );
}
