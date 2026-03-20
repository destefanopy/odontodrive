"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Cita, Paciente } from "@/core/api";
import NuevaCitaModal from "./NuevaCitaModal";

interface CalendarioMaestroProps {
  initialCitas: Cita[];
  pacientes: Paciente[];
}

export default function CalendarioMaestro({ initialCitas, pacientes }: CalendarioMaestroProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = initialCitas.map((cita) => ({
    id: cita.id,
    title: `${cita.nombre_paciente} - ${cita.motivo}`,
    start: cita.fecha_inicio,
    end: cita.fecha_fin,
    backgroundColor: "#10b981", 
    borderColor: "#059669", 
  }));

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setModalOpen(true);
  };

  const handleSelect = (arg: { start: Date; end: Date }) => {
    setSelectedDate(arg.start);
    setModalOpen(true);
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
          contentHeight="auto"
          eventContent={(eventInfo) => (
            <div className="p-1.5 overflow-hidden flex flex-col h-full rounded shadow-sm relative pl-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#31b8b3] bg-[#e6f7fa] text-[#1e7e7a]">
              <div className="font-extrabold text-[11px] leading-tight truncate">{eventInfo.event.title}</div>
              <div className="text-[10px] opacity-90 font-medium truncate">{eventInfo.timeText}</div>
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

      {modalOpen && (
        <NuevaCitaModal
          pacientes={pacientes}
          initialDate={selectedDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
