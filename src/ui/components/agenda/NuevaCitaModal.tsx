"use client";

import { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, User, FileText, ChevronDown, Plus, UserPlus, ListTodo } from "lucide-react";
import { Paciente, Cita, createCita, updateCita, createPaciente } from "@/core/api";
import { useRouter } from "next/navigation";

interface NuevaCitaModalProps {
  pacientes: Paciente[];
  initialDate: Date | null;
  existingCita?: Cita | null;
  onSaveSuccess?: () => void;
  onClose: () => void;
}

export default function NuevaCitaModal({ pacientes, initialDate, existingCita, onSaveSuccess, onClose }: NuevaCitaModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const [tipoEvento, setTipoEvento] = useState<'cita' | 'tarea'>('cita');
  const [isNuevoPaciente, setIsNuevoPaciente] = useState(false);
  const [nuevoPacienteNombre, setNuevoPacienteNombre] = useState("");

  // Buscador de pacientes
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inicializar paciente seleccionado y tipo de evento
  useEffect(() => {
    if (existingCita) {
      if (!existingCita.paciente_id) {
        setTipoEvento('tarea');
      } else {
        setTipoEvento('cita');
        setSelectedPacienteId(existingCita.paciente_id);
        const px = pacientes.find(p => p.id === existingCita.paciente_id);
        if (px) setSearchTerm(px.nombres_apellidos);
      }
    } else {
      let initialId = null;
      if (pacientes.length === 1) {
        initialId = pacientes[0].id;
      }
      
      if (initialId) {
        setSelectedPacienteId(initialId);
        const px = pacientes.find(p => p.id === initialId);
        if (px) setSearchTerm(px.nombres_apellidos);
      }
    }
  }, [existingCita, pacientes]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombres_apellidos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTimeForInput = (date: Date | null) => {
    if (!date) return "";
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const motivo = formData.get("motivo")?.toString() || "Consulta";
      const fecha = formData.get("fecha")?.toString();
      const horaInicio = formData.get("hora_inicio")?.toString();
      const horaFin = formData.get("hora_fin")?.toString();

      if (!fecha || !horaInicio || !horaFin) {
        throw new Error("Las fechas y horas son obligatorias.");
      }

      const [yyyy, mm, dd] = fecha.split('-');
      const [hh, min] = horaInicio.split(':');
      const startDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
      
      const [hhFin, minFin] = horaFin.split(':');
      const endDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hhFin), Number(minFin));

      if (endDate <= startDate) {
        throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
      }

      const finalFechaInicioStr = startDate.toISOString();
      const finalFechaFinStr = endDate.toISOString();

      let finalPacienteId: string | null = null;
      let finalNombrePaciente: string = "";

      if (tipoEvento === 'cita') {
        if (isNuevoPaciente) {
          if (!nuevoPacienteNombre.trim()) {
            throw new Error("El nombre del nuevo paciente es obligatorio.");
          }
          // Crear paciente on the fly
          const nuevo = await createPaciente({ nombres_apellidos: nuevoPacienteNombre.trim(), telefono_celular: null });
          if (!nuevo) throw new Error("Error al crear el nuevo paciente");
          finalPacienteId = nuevo.id;
          finalNombrePaciente = nuevo.nombres_apellidos;
        } else {
          if (!selectedPacienteId) {
            throw new Error("Debes seleccionar un paciente de la lista o crear uno nuevo.");
          }
          finalPacienteId = selectedPacienteId;
          finalNombrePaciente = searchTerm;
        }
      } else {
        // Tarea
        finalPacienteId = null;
        finalNombrePaciente = `Tarea: ${motivo}`;
      }

      if (existingCita) {
        await updateCita(existingCita.id!, {
          paciente_id: finalPacienteId,
          nombre_paciente: finalNombrePaciente || existingCita.nombre_paciente,
          motivo,
          fecha_inicio: finalFechaInicioStr,
          fecha_fin: finalFechaFinStr,
        });
      } else {
        await createCita({
          paciente_id: finalPacienteId,
          nombre_paciente: finalNombrePaciente || "Evento",
          motivo,
          fecha_inicio: finalFechaInicioStr,
          fecha_fin: finalFechaFinStr,
        });
      }

      if (onSaveSuccess) onSaveSuccess();
      router.refresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar el evento.");
    } finally {
      setIsPending(false);
    }
  };

  const initDate = existingCita ? new Date(existingCita.fecha_inicio) : initialDate;
  const initEndDate = existingCita ? new Date(existingCita.fecha_fin) : (initialDate ? new Date(initialDate.getTime() + 60 * 60000) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{existingCita ? "Editar Evento" : "Agendar Evento"}</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 bg-white shadow-sm p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 font-medium animate-in slide-in-from-top-1">
              {errorMsg}
            </div>
          )}

          {!existingCita && (
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTipoEvento('cita')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  tipoEvento === 'cita' ? "bg-white text-[#31b8b3] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="w-4 h-4" /> Cita Médica
              </button>
              <button
                type="button"
                onClick={() => setTipoEvento('tarea')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  tipoEvento === 'tarea' ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ListTodo className="w-4 h-4" /> Tarea
              </button>
            </div>
          )}

          {tipoEvento === 'cita' && (
            <div className="space-y-3" ref={dropdownRef}>
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#31b8b3]" />
                  Paciente
                </label>
                <button
                  type="button"
                  onClick={() => setIsNuevoPaciente(!isNuevoPaciente)}
                  className="text-xs font-bold text-[#31b8b3] flex items-center gap-1 hover:text-[#1e7e7a]"
                >
                  {isNuevoPaciente ? "Seleccionar Existente" : <><UserPlus className="w-3 h-3" /> Nuevo Paciente</>}
                </button>
              </div>
              
              {isNuevoPaciente ? (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Nombres y Apellidos del paciente..."
                    value={nuevoPacienteNombre}
                    onChange={(e) => setNuevoPacienteNombre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#31b8b3]/30 bg-[#e6f7fa]/30 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-500 mt-1 ml-1">Se creará un nuevo perfil de paciente automáticamente.</p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar paciente por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedPacienteId) {
                        const match = pacientes.find(p => p.id === selectedPacienteId);
                        if (match && match.nombres_apellidos !== e.target.value) {
                          setSelectedPacienteId(null);
                        }
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {pacientesFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-sm font-medium text-gray-500 flex flex-col items-center gap-2">
                          <span>No se encontraron resultados</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNuevoPaciente(true);
                              setNuevoPacienteNombre(searchTerm);
                              setIsDropdownOpen(false);
                            }}
                            className="text-xs bg-[#e6f7fa] text-[#1e7e7a] px-3 py-1.5 rounded-lg font-bold"
                          >
                            Crear paciente "{searchTerm}"
                          </button>
                        </div>
                      ) : (
                        <div className="py-2">
                          {pacientesFiltrados.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPacienteId(p.id);
                                setSearchTerm(p.nombres_apellidos);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors hover:bg-[#e6f7fa] hover:text-[#1e7e7a] ${
                                selectedPacienteId === p.id ? "bg-[#e6f7fa] text-[#1e7e7a] font-bold" : "text-gray-700"
                              }`}
                            >
                              {p.nombres_apellidos}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                defaultValue={formatDateForInput(initDate)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Hora Inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                defaultValue={formatTimeForInput(initDate) || "09:00"}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2 col-start-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Hora Fin
              </label>
              <input
                type="time"
                name="hora_fin"
                defaultValue={formatTimeForInput(initEndDate) || "10:00"}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText className={`w-4 h-4 ${tipoEvento === 'tarea' ? 'text-orange-500' : 'text-[#31b8b3]'}`} />
              {tipoEvento === 'tarea' ? 'Título de la Tarea' : 'Motivo de Consulta'}
            </label>
            <input
              type="text"
              name="motivo"
              placeholder={tipoEvento === 'tarea' ? 'Ej. Ir de compras, Laboratorio...' : 'Ej. Diagnóstico, Limpieza...'}
              defaultValue={existingCita?.motivo || ""}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-70 ${
                tipoEvento === 'tarea' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#31b8b3] hover:bg-[#279490]'
              }`}
            >
              {isPending ? "Procesando..." : existingCita ? "Guardar Cambios" : "Confirmar Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
