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
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          events={events}
          dateClick={handleDateClick}
          selectable={true}
          select={handleSelect}
          contentHeight="auto"
          eventContent={(eventInfo) => (
            <div className="p-1 overflow-hidden">
              <div className="font-bold text-xs">{eventInfo.event.title}</div>
              <div className="text-[10px] opacity-90">{eventInfo.timeText}</div>
            </div>
          )}
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
        .calendarmacro .fc-button-primary {
          background-color: #111827 !important;
          border-color: #111827 !important;
          color: #ffffff !important;
          border-radius: 8px;
          text-transform: capitalize;
          font-weight: 600;
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .calendarmacro .fc-toolbar-title {
            font-size: 1.1rem !important;
          }
          .calendarmacro .fc-button {
            padding: 0.3rem 0.6rem !important;
            font-size: 0.75rem !important;
          }
          .calendarmacro .fc-header-toolbar {
            flex-direction: column;
            gap: 1rem;
          }
        }
        .calendarmacro .fc-button-primary:hover {
          background-color: #374151 !important;
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
