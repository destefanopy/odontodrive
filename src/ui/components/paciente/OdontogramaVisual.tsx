import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { guardarOdontogramaAction } from "@/app/pacientes/actions";
import { Save, AlertCircle } from "lucide-react";

// Estados posibles de un diente
type ToothState = "sano" | "caries" | "tratado" | "ausente";

interface OdontogramaProps {
  pacienteId: string;
  initialOdontograma?: Record<number, string>;
}



// Recreamos rápidamente los arcos para el ejemplo interactivo
const maxilarSuperior = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const maxilarInferior = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

export default function OdontogramaVisual({ pacienteId, initialOdontograma = {} }: OdontogramaProps) {
  const [teethData, setTeethData] = useState<Record<number, ToothState>>(initialOdontograma as Record<number, ToothState>);
  const [selectedTool, setSelectedTool] = useState<ToothState>("sano");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await guardarOdontogramaAction(pacienteId, teethData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  const toggleTooth = (id: number) => {
    setTeethData((prev) => ({
      ...prev,
      [id]: selectedTool,
    }));
  };

  const getToothColor = (state?: ToothState) => {
    switch (state) {
      case "caries": return "bg-rose-500 border-rose-600 shadow-rose-500/30";
      case "tratado": return "bg-blue-500 border-blue-600 shadow-blue-500/30";
      case "ausente": return "bg-gray-200 border-gray-300 opacity-50";
      default: return "bg-white border-gray-200 hover:border-teal-400";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Odontograma Interactivo</h2>
          <p className="text-sm text-gray-500">
            Selecciona una herramienta y haz clic sobre las piezas dentales para registrar el estado.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {/* Barra de herramientas */}
          <div className="flex bg-gray-100 p-1.5 rounded-full shadow-inner gap-1">
            {(["sano", "caries", "tratado", "ausente"] as ToothState[]).map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                  selectedTool === tool
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                {tool}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      {/* Grid del Odontograma */}
      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col items-center gap-12 sm:min-w-[700px] overflow-x-auto">
        
        {/* Maxilar Superior */}
        <div className="flex gap-2 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Maxilar Superior
          </div>
          {maxilarSuperior.map((id) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400">{id}</span>
              <button
                onClick={() => toggleTooth(id)}
                className={cn(
                  "w-8 h-12 rounded-t-xl rounded-b-md border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 flex items-center justify-center text-xs",
                  getToothColor(teethData[id])
                )}
                title={`Pieza ${id}`}
              />
            </div>
          ))}
        </div>

        {/* Maxilar Inferior */}
        <div className="flex gap-2 relative">
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Maxilar Inferior
          </div>
          {maxilarInferior.map((id) => (
            <div key={id} className="flex flex-col-reverse items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400">{id}</span>
              <button
                onClick={() => toggleTooth(id)}
                className={cn(
                  "w-8 h-12 rounded-b-xl rounded-t-md border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 flex items-center justify-center text-xs",
                  getToothColor(teethData[id])
                )}
                title={`Pieza ${id}`}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
