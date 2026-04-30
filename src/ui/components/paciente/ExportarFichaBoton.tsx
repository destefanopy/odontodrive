"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Download } from "lucide-react";
import FichaImprimible from "./FichaImprimible";
import { Paciente, AntecedentesMedicos } from "@/core/api";

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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ficha_${paciente.nombres_apellidos.replace(/\s+/g, "_")}`,
    removeAfterPrint: true,
  });

  return (
    <>
      <button
        onClick={handlePrint}
        className="px-4 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl border border-gray-200 shadow-sm text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
        title="Exportar a PDF"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exportar Ficha</span>
      </button>

      {/* Componente oculto que se usará sólo para imprimir */}
      <div style={{ display: "none" }}>
        <FichaImprimible
          ref={componentRef}
          paciente={paciente}
          antecedentes={antecedentes}
          initialOdontograma={initialOdontograma}
          finalOdontograma={finalOdontograma}
        />
      </div>
    </>
  );
}
