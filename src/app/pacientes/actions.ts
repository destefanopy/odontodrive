"use server";

import { createPaciente } from "@/core/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registrarPacienteAction(prevState: unknown, formData: FormData) {
  const nombres_apellidos = formData.get("nombres_apellidos")?.toString() || "";
  const telefono_celular = formData.get("telefono_celular")?.toString() || null;

  if (!nombres_apellidos.trim()) {
    return {
      error: "El nombre y apellido son obligatorios.",
      success: false,
    };
  }

  try {
    await createPaciente({ nombres_apellidos, telefono_celular });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "No se pudo crear el paciente.";
    return {
      error: errorMsg,
      success: false,
    };
  }

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

export async function guardarOdontogramaAction(pacienteId: string, teethData: Record<number, string>) {
  try {
    const { saveOdontograma } = await import("@/core/api");
    await saveOdontograma(pacienteId, teethData);
    revalidatePath(`/pacientes/${pacienteId}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error guardando el odontograma.";
    return { error: errorMsg, success: false };
  }
}

export async function guardarFichaAction(pacienteId: string, formData: FormData) {
  try {
    const { saveAntecedentes } = await import("@/core/api");
    const datos = {
      alergias: formData.get("alergias")?.toString() || null,
      problemas_coagulacion: formData.get("problemas_coagulacion")?.toString() || null,
      enfermedades_sistemicas: formData.get("enfermedades_sistemicas")?.toString() || null,
      internaciones_previas: formData.get("internaciones_previas")?.toString() || null,
      antecedentes_familiares: formData.get("antecedentes_familiares")?.toString() || null,
      medicacion_actual: formData.get("medicacion_actual")?.toString() || null,
      observaciones: formData.get("observaciones")?.toString() || null,
    };
    
    await saveAntecedentes(pacienteId, datos);
    revalidatePath(`/pacientes/${pacienteId}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error guardando la ficha clínica.";
    return { error: errorMsg, success: false };
  }
}

export async function actualizarPacienteAction(pacienteId: string, formData: FormData) {
  try {
    const { updatePacienteData } = await import("@/core/api");
    const datos = {
      nombres_apellidos: formData.get("nombres_apellidos")?.toString() || "",
      telefono_celular: formData.get("telefono_celular")?.toString() || null,
      documento_identidad: formData.get("documento_identidad")?.toString() || null,
      fecha_nacimiento: formData.get("fecha_nacimiento")?.toString() || null,
      sexo: formData.get("sexo")?.toString() || null,
      grupo_sanguineo: formData.get("grupo_sanguineo")?.toString() || null,
      estado_civil: formData.get("estado_civil")?.toString() || null,
      lugar_residencia: formData.get("lugar_residencia")?.toString() || null,
      profesion: formData.get("profesion")?.toString() || null,
      contacto_urgencia: formData.get("contacto_urgencia")?.toString() || null,
    };
    
    if (!datos.fecha_nacimiento) datos.fecha_nacimiento = null;

    if (!datos.nombres_apellidos.trim()) {
       return { error: "El Nombre y Apellido no pueden estar vacíos.", success: false };
    }

    await updatePacienteData(pacienteId, datos);
    revalidatePath(`/pacientes/${pacienteId}`);
    revalidatePath(`/pacientes`);
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error guardando los datos personales.";
    return { error: errorMsg, success: false };
  }
}

export async function crearCitaAction(formData: FormData) {
  try {
    const { createCita } = await import("@/core/api");
    
    const pacienteId = formData.get("paciente_id")?.toString();
    const nombrePaciente = formData.get("nombre_paciente")?.toString();
    const motivo = formData.get("motivo")?.toString() || "Consulta Métrica";
    const fecha = formData.get("fecha")?.toString();
    const horaInicio = formData.get("hora_inicio")?.toString();
    const horaFin = formData.get("hora_fin")?.toString();

    if (!pacienteId || !fecha || !horaInicio || !horaFin) {
      return { error: "Faltan datos obligatorios para agendar la cita.", success: false };
    }

    const fechaInicioStr = `${fecha}T${horaInicio}:00`;
    const fechaFinStr = `${fecha}T${horaFin}:00`;

    const nuevaCita = {
      paciente_id: pacienteId,
      nombre_paciente: nombrePaciente || "Paciente",
      motivo,
      fecha_inicio: new Date(fechaInicioStr).toISOString(),
      fecha_fin: new Date(fechaFinStr).toISOString(),
    };

    await createCita(nuevaCita);
    revalidatePath("/agenda");
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error agendando la cita.";
    return { error: errorMsg, success: false };
  }
}
