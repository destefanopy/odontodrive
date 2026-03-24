"use client";

import { useState, useTransition } from "react";
import { Save, AlertCircle } from "lucide-react";
import { guardarOdontogramaAction } from "@/app/(dashboard)/pacientes/actions";

export type SurfaceState = "healthy" | "caries" | "treated" | "absent";

export interface ToothSurfaces {
  top: SurfaceState;
  bottom: SurfaceState;
  left: SurfaceState;
  right: SurfaceState;
  center: SurfaceState;
  root: SurfaceState;
}

const DEFAULT_TOOTH: ToothSurfaces = {
  top: "healthy",
  bottom: "healthy",
  left: "healthy",
  right: "healthy",
  center: "healthy",
  root: "healthy",
};

interface OdontogramaVisualProps {
  pacienteId: string;
  initialOdontograma: Record<number, any>;
}

type ToolType = "healthy" | "caries" | "treated" | "absent";

export default function OdontogramaVisual({ pacienteId, initialOdontograma }: OdontogramaVisualProps) {
  // Manejo de migración desde el formato antiguo (string) al nuevo formato (ToothSurfaces)
  const migrateInitial = (data: Record<number, any>) => {
    const migrated: Record<number, ToothSurfaces> = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === "string") {
        // Formato viejo, convertir todo el diente a ese estado
        migrated[Number(key)] = {
          top: val as SurfaceState, bottom: val as SurfaceState,
          left: val as SurfaceState, right: val as SurfaceState,
          center: val as SurfaceState, root: val as SurfaceState
        };
      } else {
        migrated[Number(key)] = val as ToothSurfaces;
      }
    }
    return migrated;
  };

  const [teethData, setTeethData] = useState<Record<number, ToothSurfaces>>(migrateInitial(initialOdontograma));
  const [activeTool, setActiveTool] = useState<ToolType>("caries");
  const [isPending, startTransition] = useTransition();

  const handleSurfaceClick = (toothId: number, surface: keyof ToothSurfaces) => {
    setTeethData((prev) => {
      const currentTooth = prev[toothId] || { ...DEFAULT_TOOTH };
      const newActiveTool = activeTool;
      
      // Si la herramienta es absente (x), a menudo se marca todo el diente.
      if (activeTool === "absent" && surface !== "root") {
        // En un odontograma clásico, marcar absent pinta un aspa en toda la corona.
        // Lo simularemos aplicando a todo el diente.
        return {
          ...prev,
          [toothId]: {
            top: "absent", bottom: "absent", left: "absent", right: "absent", center: "absent", root: "absent"
          }
        };
      }

      return {
        ...prev,
        [toothId]: {
          ...currentTooth,
          [surface]: currentTooth[surface] === newActiveTool ? "healthy" : newActiveTool,
        },
      };
    });
  };

  const getFillColor = (state: SurfaceState) => {
    switch (state) {
      case "caries": return "#ef4444"; // red-500
      case "treated": return "#3b82f6"; // blue-500
      case "absent": return "#d1d5db"; // gris (marcaremos la X por encima)
      default: return "#ffffff";
    }
  };

  const adultTeeth = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
    lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  };

  const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerRight: [85, 84, 83, 82, 81],
    lowerLeft: [71, 72, 73, 74, 75],
  };

  // Componente interno para dibujar UN diente SVGs interactivo
  const InteractiveTooth = ({ id, isUpper }: { id: number, isUpper: boolean }) => {
    const data = teethData[id] || { ...DEFAULT_TOOTH };
    const isAbsent = data.center === "absent" && data.top === "absent"; // heuristica de ausente

    // Geometria Matematica de la Corona (50x50px)
    // Coordenadas relativas
    const centerPoly = "15,15 35,15 35,35 15,35";
    const topPoly = "0,0 50,0 35,15 15,15";
    const bottomPoly = "0,50 50,50 35,35 15,35";
    const leftPoly = "0,0 15,15 15,35 0,50";
    const rightPoly = "50,0 35,15 35,35 50,50";

    // Determinar cantidad de puntas de la raiz segun el diente
    const idStr = id.toString();
    const isMolar = ["6","7","8"].includes(idStr[1]);
    const isPremolar = ["4","5"].includes(idStr[1]);
    
    // Raiz apuntando arriba si es maxilar superior, abajo si es inferior
    // Box de raiz = 50x40
    let RootPaths = () => <polygon points={isUpper ? "25,0 15,40 35,40" : "25,40 15,0 35,0"} />;
    if (isMolar && isUpper) {
       RootPaths = () => (
         <>
           <polygon points="10,0 15,40 25,40" />
           <polygon points="25,0 20,40 30,40" />
           <polygon points="40,0 25,40 35,40" />
         </>
       );
    } else if (isMolar && !isUpper) {
       RootPaths = () => (
         <>
           <polygon points="15,40 10,0 25,0" />
           <polygon points="35,40 25,0 40,0" />
         </>
       );
    }

    return (
      <div className="flex flex-col items-center group relative w-12 cursor-pointer touch-manipulation">
        <span className="text-xs font-bold text-gray-500 mb-1 leading-none">{id}</span>
        
        {/* Renderizado de Raiz Maxilar Superior */}
        {isUpper && (
          <div className="w-full h-8 mb-1" onClick={() => handleSurfaceClick(id, "root")}>
            <svg viewBox="0 0 50 40" className="w-full h-full stroke-gray-800 hover:drop-shadow-md transition-all" strokeWidth="2" fill={getFillColor(data.root)}>
               <RootPaths />
            </svg>
          </div>
        )}

        {/* Corona SVG */}
        <div className="relative w-10 h-10 border border-transparent shadow-sm hover:shadow-md transition-all bg-white rounded-full">
           <svg viewBox="0 0 50 50" className="w-full h-full stroke-gray-800" strokeWidth="2" strokeLinejoin="round">
              <polygon points={topPoly} fill={getFillColor(data.top)} className="hover:fill-emerald-100 transition-colors" opacity={isAbsent ? 0.3 : 1} onClick={() => handleSurfaceClick(id, "top")} />
              <polygon points={bottomPoly} fill={getFillColor(data.bottom)} className="hover:fill-emerald-100 transition-colors" opacity={isAbsent ? 0.3 : 1} onClick={() => handleSurfaceClick(id, "bottom")} />
              <polygon points={leftPoly} fill={getFillColor(data.left)} className="hover:fill-emerald-100 transition-colors" opacity={isAbsent ? 0.3 : 1} onClick={() => handleSurfaceClick(id, "left")} />
              <polygon points={rightPoly} fill={getFillColor(data.right)} className="hover:fill-emerald-100 transition-colors" opacity={isAbsent ? 0.3 : 1} onClick={() => handleSurfaceClick(id, "right")} />
              <polygon points={centerPoly} fill={getFillColor(data.center)} className="hover:fill-emerald-100 transition-colors" opacity={isAbsent ? 0.3 : 1} onClick={() => handleSurfaceClick(id, "center")} />
           </svg>
           {/* Marca de Extraccion Completa X */}
           {isAbsent && (
             <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 50">
                <line x1="0" y1="0" x2="50" y2="50" stroke="#000" strokeWidth="4" />
                <line x1="50" y1="0" x2="0" y2="50" stroke="#000" strokeWidth="4" />
             </svg>
           )}
        </div>

        {/* Renderizado de Raiz Maxilar Inferior */}
        {!isUpper && (
          <div className="w-full h-8 mt-1" onClick={() => handleSurfaceClick(id, "root")}>
            <svg viewBox="0 0 50 40" className="w-full h-full stroke-gray-800 hover:drop-shadow-md transition-all" strokeWidth="2" fill={getFillColor(data.root)}>
               <RootPaths />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      // El Server Action ya está en actions.ts, y acepta any record.
      const result = await guardarOdontogramaAction(pacienteId, teethData);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        alert("¡Odontograma guardado con éxito!");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 mb-24">
      {/* Selector de Herramientas UI */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-100 p-4 rounded-3xl shadow-sm gap-4">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto gap-2 preserve-3d">
          <ToolButton name="Caries (Rojo)" tool="caries" current={activeTool} setTool={setActiveTool} colorClass="bg-red-500" />
          <ToolButton name="Restaurado (Azul)" tool="treated" current={activeTool} setTool={setActiveTool} colorClass="bg-blue-500" />
          <ToolButton name="Sano" tool="healthy" current={activeTool} setTool={setActiveTool} colorClass="bg-white border border-gray-300" />
          <ToolButton name="Ausente (X)" tool="absent" current={activeTool} setTool={setActiveTool} colorClass="bg-gray-800" />
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isPending ? "Guardando..." : "Guardar Odontograma"}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 lg:p-10 shadow-inner overflow-x-auto flex justify-center min-h-[500px]">
        <div className="flex flex-col gap-12 min-w-max items-center">
          
          {/* MAXILAR SUPERIOR */}
          <div className="flex flex-col items-center gap-6 border-b-2 border-dashed border-gray-300 pb-12 w-full">
            {/* Dientes Permanentes */}
            <div className="flex gap-1 md:gap-3">
              {[...adultTeeth.upperRight].map(id => <InteractiveTooth key={id} id={id} isUpper={true} />)}
              <div className="w-2 border-r-2 border-gray-800 mx-1 md:mx-4 hidden sm:block"></div>
              {[...adultTeeth.upperLeft].map(id => <InteractiveTooth key={id} id={id} isUpper={true} />)}
            </div>

            {/* Dientes Temporales */}
            <div className="flex gap-1 md:gap-4 mt-2">
              {[...childTeeth.upperRight].map(id => <InteractiveTooth key={id} id={id} isUpper={true} />)}
              <div className="w-2 border-r-2 border-gray-400 mx-2 md:mx-6 hidden sm:block"></div>
              {[...childTeeth.upperLeft].map(id => <InteractiveTooth key={id} id={id} isUpper={true} />)}
            </div>
          </div>

          {/* MAXILAR INFERIOR */}
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Dientes Temporales */}
            <div className="flex gap-1 md:gap-4">
              {[...childTeeth.lowerRight].map(id => <InteractiveTooth key={id} id={id} isUpper={false} />)}
              <div className="w-2 border-r-2 border-gray-400 mx-2 md:mx-6 hidden sm:block"></div>
              {[...childTeeth.lowerLeft].map(id => <InteractiveTooth key={id} id={id} isUpper={false} />)}
            </div>

            {/* Dientes Permanentes */}
            <div className="flex gap-1 md:gap-3 mt-2">
              {[...adultTeeth.lowerRight].map(id => <InteractiveTooth key={id} id={id} isUpper={false} />)}
              <div className="w-2 border-r-2 border-gray-800 mx-1 md:mx-4 hidden sm:block"></div>
              {[...adultTeeth.lowerLeft].map(id => <InteractiveTooth key={id} id={id} isUpper={false} />)}
            </div>
          </div>

        </div>
      </div>
      
      <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
        <AlertCircle className="w-4 h-4" />
        <p>Selecciona una herramienta y dibuja sobre corona o raíz de la pieza dental.</p>
      </div>
    </div>
  );
}

function ToolButton({ name, tool, current, setTool, colorClass }: any) {
  const active = current === tool;
  return (
    <button
      onClick={() => setTool(tool)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
        active 
          ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-200 translate-y-[-2px]" 
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200 opacity-80 hover:opacity-100"
      }`}
    >
      <div className={`w-4 h-4 rounded-full shadow-inner ${colorClass}`}></div>
      {name}
    </button>
  );
}
