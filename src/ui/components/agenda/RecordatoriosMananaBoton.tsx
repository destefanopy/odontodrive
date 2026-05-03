"use client";

import { useState } from "react";
import { Cita, Paciente } from "@/core/api";
import { MessageCircle, Bell, X, PhoneMissed } from "lucide-react";

export default function RecordatoriosMananaBoton({ citas, pacientes }: { citas: Cita[], pacientes: Paciente[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Calcular las citas de mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrow);

  const citasManana = citas.filter((c) => {
    if (!c.fecha_inicio) return false;
    const citaDateStr = getLocalDateStr(new Date(c.fecha_inicio));
    return citaDateStr === tomorrowStr;
  });

  if (citasManana.length === 0) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#e6f7fa] text-[#1e7e7a] px-5 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-[#d0f0f4] hover:shadow-md transition-all border border-[#31b8b3]/30"
      >
        <Bell className="w-5 h-5 text-[#31b8b3] animate-pulse" />
        Recordatorios de Mañana ({citasManana.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#31b8b3]" />
                Recordatorios
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-800 hover:text-gray-800 bg-white shadow-sm p-2 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3">
              <p className="text-sm text-gray-600 mb-4 font-medium">Turnos agendados para mañana ({tomorrow.toLocaleDateString()}):</p>
              
              {citasManana.map(cita => {
                const pacienteInfo = pacientes.find(p => p.id === cita.paciente_id);
                const hasPhone = pacienteInfo && pacienteInfo.telefono_celular && pacienteInfo.telefono_celular.trim() !== "";
                const timeStr = new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const fn = pacienteInfo?.nombres_apellidos || cita.nombre_paciente;
                
                return (
                  <div key={cita.id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:border-[#31b8b3]/30 transition-colors">
                    <div>
                       <p className="font-bold text-gray-900 text-sm">{fn}</p>
                       <p className="text-xs font-semibold text-gray-500 capitalize mt-1">{cita.motivo} • {timeStr} hs</p>
                    </div>
                    {hasPhone ? (() => {
                      const text = `Hola ${fn}, te recordamos tu turno de odontología para el día de mañana a las ${timeStr} hs. ¡Te esperamos!`;
                      const phoneUrl = `https://wa.me/${pacienteInfo.telefono_celular!.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                      return (
                        <a 
                          href={phoneUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 shrink-0 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all ml-3 shadow-[0_2px_10px_rgba(37,211,102,0.2)] border border-[#25D366]/20"
                          title="Enviar Mensaje por WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      );
                    })() : (
                      <div className="w-10 h-10 shrink-0 bg-red-50 text-red-400 rounded-full flex items-center justify-center ml-3 shadow-sm border border-red-100" title="Paciente sin celular guardado">
                        <PhoneMissed className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
