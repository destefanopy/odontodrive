"use client";

import { useState, useTransition } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { MessageCircle } from "lucide-react";
import { Cita, Paciente, deleteCita, updateCita, getCitas } from "@/core/api";
import NuevaCitaModal from "./NuevaCitaModal";
import { useRouter } from "next/navigation";

interface CalendarioProps {
  initialCitas: Cita[];
  pacientes: Paciente[];
}

export default function CalendarioMaestro({ initialCitas, pacientes }: CalendarioProps) {
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editCitaInfo, setEditCitaInfo] = useState<Cita | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUpdatedCitas = async () => {
    try {
      const data = await getCitas();
      setCitas(data);
    } catch (error) {
      console.error("Error al actualizar citas", error);
    }
  };

  const events = citas.map((cita) => {
    const isTarea = !cita.paciente_id;
    return {
      id: cita.id,
      title: cita.nombre_paciente,
      extendedProps: { motivo: cita.motivo, paciente_id: cita.paciente_id, realCita: cita, isTarea },
      start: cita.fecha_inicio,
      end: cita.fecha_fin,
      backgroundColor: isTarea ? "#f97316" : "#10b981", 
      borderColor: isTarea ? "#ea580c" : "#059669", 
    };
  });

  const handleDateClick = (arg: { date: Date }) => {
    setEditCitaInfo(null);
    setSelectedDate(arg.date);
    setIsModalOpen(true);
  };

  const handleSelect = (info: any) => {
    setEditCitaInfo(null);
    setSelectedDate(info.start);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsEventModalOpen(true);
  };

  const handleDeleteCita = async () => {
    if (!selectedEvent) return;
    
    setIsDeleting(true);
    try {
      await deleteCita(selectedEvent.id);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      await fetchUpdatedCitas();
    } catch (error: any) {
      alert("Error: " + (error.message || "Error al borrar la cita."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEventChange = async (changeInfo: any) => {
    try {
      await updateCita(changeInfo.event.id, {
        fecha_inicio: changeInfo.event.start.toISOString(),
        fecha_fin: changeInfo.event.end ? changeInfo.event.end.toISOString() : changeInfo.event.start.toISOString(),
      });
      await fetchUpdatedCitas();
    } catch (error) {
      alert("Error al mover la cita.");
      changeInfo.revert();
    }
  };

  return (
    <>
      <div className="h-full w-full calendarmacro">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locales={[esLocale]}
          locale="es"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          events={events}
          dateClick={handleDateClick}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          editable={true}
          eventDurationEditable={true}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
          height="100%"
          eventContent={(eventInfo) => (
            <div className={`p-0.5 overflow-hidden flex flex-col h-full rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative pl-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${eventInfo.event.extendedProps.isTarea ? 'before:bg-orange-500 bg-orange-50 text-orange-900' : 'before:bg-[#31b8b3] bg-[#e6f7fa] text-[#1e7e7a]'}`}>
              <div className="font-extrabold text-[9px] sm:text-[10px] leading-tight truncate px-0.5">{eventInfo.event.title}</div>
              <div className="text-[8px] sm:text-[9px] opacity-80 font-medium truncate px-0.5 hidden sm:block">{eventInfo.timeText}</div>
            </div>
          )}
          eventClassNames="!bg-transparent !border-none"
        />
      </div>

      <style jsx global>{`
        .calendarmacro .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f3f4f6;
        }
        .calendarmacro .fc-col-header-cell {
          background-color: #f9fafb;
          padding: 8px 0;
          font-weight: 700;
          color: #374151;
          text-transform: capitalize;
        }
        /* Botones Superiores */
        .calendarmacro .fc-button-primary {
          background-color: #31b8b3 !important;
          border-color: #31b8b3 !important;
          color: #ffffff !important;
          border-radius: 8px;
          text-transform: capitalize;
          font-weight: 700;
          box-shadow: 0 2px 10px -3px rgba(49, 184, 179, 0.4);
        }
        
        .calendarmacro .fc-button-primary:hover {
          background-color: #279490 !important;
        }

        .calendarmacro .fc-button-active {
          background-color: #1e7e7a !important;
        }

        .fc .fc-day-today {
          background-color: #f8fafc !important;
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .calendarmacro .fc-toolbar-title {
            font-size: 0.95rem !important; /* Más pequeño para cel */
            white-space: nowrap;
          }
          .calendarmacro .fc-button {
            padding: 0.25rem 0.5rem !important;
            font-size: 0.70rem !important;
          }
          .calendarmacro .fc-header-toolbar {
            flex-direction: column;
            gap: 1rem;
          }
        }
        
        .calendarmacro {
          font-family: inherit;
        }
        .calendarmacro .fc-button-active {
          background-color: #059669 !important;
          border-color: #059669 !important;
        }
        .calendarmacro .fc-today-button {
          background-color: #fff !important;
          color: #111827 !important;
          border-color: #e5e7eb !important;
        }
        .fc .fc-toolbar-title {
           font-size: 1.25rem !important;
           font-weight: 800;
        }
      `}</style>

      {isModalOpen && (
        <NuevaCitaModal
          pacientes={pacientes}
          initialDate={selectedDate}
          existingCita={editCitaInfo}
          onSaveSuccess={fetchUpdatedCitas}
          onClose={() => {
            setIsModalOpen(false);
            setEditCitaInfo(null);
          }}
        />
      )}

      {isEventModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsEventModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-gray-900 mb-2">{selectedEvent.extendedProps?.isTarea ? "Detalles de la Tarea" : "Detalles de la Cita"}</h2>
            <div className="space-y-4 mb-6 text-sm text-gray-700">
              <div>
                <span className="font-bold text-gray-900 uppercase text-[10px]">{selectedEvent.extendedProps?.isTarea ? "Tarea:" : "Paciente:"}</span>
                <p className="font-medium">{selectedEvent.title}</p>
              </div>
              <div>
                <span className="font-bold text-gray-900 uppercase text-[10px]">Motivo:</span>
                <p>{selectedEvent.extendedProps?.motivo || "Sin Motivo"}</p>
              </div>
              <div>
                <span className="font-bold text-gray-900 uppercase text-[10px]">Horario:</span>
                <p>{selectedEvent.start?.toLocaleString()} - {selectedEvent.end ? selectedEvent.end.toLocaleString() : "No definido"}</p>
              </div>
            </div>

            {(() => {
              if (selectedEvent.extendedProps?.isTarea) return null;
              const pacienteData = pacientes.find(p => p.id === selectedEvent.extendedProps.paciente_id);
              if (pacienteData && pacienteData.telefono_celular) {
                const phone = pacienteData.telefono_celular.replace(/\D/g, "");
                const isTomorrow = new Date(selectedEvent.start).getDate() === new Date().getDate() + 1;
                const timeStr = selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const fechaStr = selectedEvent.start.toLocaleDateString();
                const text = `Hola ${pacienteData.nombres_apellidos}, te recordamos tu turno de odontología para el ${isTomorrow ? 'día de mañana' : fechaStr} a las ${timeStr} hs. ¡Te esperamos!`;
                return (
                  <a 
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-3 rounded-xl mb-3 flex items-center justify-center gap-2 font-bold hover:bg-[#20bd5a] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enviar Recordatorio (WhatsApp)
                  </a>
                );
              }
              return null;
            })()}
            
            <div className="flex justify-between gap-2 sm:gap-3">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="flex-1 py-3 px-2 sm:px-4 bg-gray-100 text-gray-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setIsEventModalOpen(false);
                  setEditCitaInfo(selectedEvent.extendedProps.realCita);
                  setSelectedDate(selectedEvent.start);
                  setIsModalOpen(true);
                }}
                className="flex-1 py-3 px-2 sm:px-4 bg-[#e6f7fa] text-[#1e7e7a] border border-[#31b8b3]/30 text-xs sm:text-sm font-bold rounded-xl hover:bg-[#d0f0f4]"
              >
                Editar
              </button>
              <button
                onClick={handleDeleteCita}
                disabled={isDeleting}
                className="flex-1 py-3 px-2 sm:px-4 bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm font-bold rounded-xl hover:bg-red-100 hover:border-red-300 disabled:opacity-50"
              >
                {isDeleting ? "Cancelando" : (selectedEvent.extendedProps?.isTarea ? "Eliminar Tarea" : "Cancelar Cita")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
