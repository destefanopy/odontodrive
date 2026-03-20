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
