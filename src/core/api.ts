import { supabase } from '@/infrastructure/supabase';

// Intefaces que reflejan las tablas reales de Supabase
export interface Paciente {
  id: string;
  nombres_apellidos: string;
  telefono_celular: string | null;
  fecha_ingreso: string;
}

/**
 * Obtiene los últimos pacientes registrados en la base de datos real.
 * Respeta la separación de responsabilidades (SoC).
 */
export const getUltimosPacientes = async (): Promise<Paciente[]> => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('fecha_ingreso', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error obteniendo pacientes:', error.message);
    return [];
  }

  return data as Paciente[];
};

/**
 * Obtiene un paciente específico por su ID.
 */
export const getPacienteById = async (id: string): Promise<Paciente | null> => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo el paciente:', error.message);
    return null;
  }

  return data as Paciente;
};

/**
 * Registra un nuevo paciente en la base de datos real.
 * Respeta la separación de responsabilidades (SoC).
 */
export const createPaciente = async (data: Omit<Paciente, 'id' | 'fecha_ingreso'>): Promise<Paciente | null> => {
  // Use ISO string without milliseconds or local time formats depending on DB format
  const fechaIngreso = new Date().toISOString(); 
  const { data: newPaciente, error } = await supabase
    .from('pacientes')
    .insert([{ ...data, fecha_ingreso: fechaIngreso }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creando paciente:', error.message);
    throw new Error(error.message);
  }

  return newPaciente as Paciente;
};

/**
 * API DEL ODONTOGRAMA
 */

export const getOdontograma = async (pacienteId: string): Promise<Record<number, string>> => {
  const { data, error } = await supabase
    .from('odontograma_registros')
    .select('pieza_dental, estado')
    .eq('paciente_id', pacienteId);

  if (error) {
    console.error('Error obteniendo odontograma:', error.message);
    return {};
  }

  const result: Record<number, string> = {};
  if (data) {
    data.forEach(item => {
      // Mapeamos a Record<number, string> (Ej: { 18: 'caries' })
      result[item.pieza_dental] = item.estado;
    });
  }
  return result;
};

export const saveOdontograma = async (pacienteId: string, registros: Record<number, string>): Promise<boolean> => {
  // Estrategia Vibe Atómico: Descartamos el estado anterior y persistimos el nuevo completo para evitar comprobaciones complejas de deltas.
  const { error: deleteError } = await supabase
    .from('odontograma_registros')
    .delete()
    .eq('paciente_id', pacienteId);

  if (deleteError) {
    console.error('Error limpiando odontograma anterior:', deleteError.message);
    throw new Error(deleteError.message);
  }

  const arrParaInsertar = Object.entries(registros).map(([pieza, estado]) => ({
    paciente_id: pacienteId,
    pieza_dental: parseInt(pieza, 10),
    estado: estado
  }));

  if (arrParaInsertar.length > 0) {
    const { error: insertError } = await supabase
      .from('odontograma_registros')
      .insert(arrParaInsertar);

    if (insertError) {
      console.error('Error guardando odontograma:', insertError.message);
      throw new Error(insertError.message);
    }
  }

  return true;
};
