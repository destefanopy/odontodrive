import { supabase } from '@/infrastructure/supabase';

// Intefaces que reflejan las tablas reales de Supabase
export interface Paciente {
  id: string;
  nombres_apellidos: string;
  telefono_celular: string | null;
  fecha_ingreso: string;
  documento_identidad?: string | null;
  fecha_nacimiento?: string | null;
  sexo?: string | null;
  grupo_sanguineo?: string | null;
  estado_civil?: string | null;
  lugar_residencia?: string | null;
  profesion?: string | null;
  contacto_urgencia?: string | null;
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

export const updatePacienteData = async (pacienteId: string, datos: Partial<Paciente>): Promise<boolean> => {
  const { error } = await supabase
    .from('pacientes')
    .update(datos)
    .eq('id', pacienteId);

  if (error) {
    console.error('Error actualizando paciente:', error.message);
    throw new Error(error.message);
  }

  return true;
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

/**
 * API DE ANTECEDENTES MÉDICOS (Ficha Clínica)
 */

export interface AntecedentesMedicos {
  id?: string;
  paciente_id: string;
  alergias?: string | null;
  problemas_coagulacion?: string | null;
  enfermedades_sistemicas?: string | null;
  internaciones_previas?: string | null;
  antecedentes_familiares?: string | null;
  medicacion_actual?: string | null;
  observaciones?: string | null;
}

export const getAntecedentes = async (pacienteId: string): Promise<AntecedentesMedicos | null> => {
  const { data, error } = await supabase
    .from('antecedentes_medicos')
    .select('*')
    .eq('paciente_id', pacienteId)
    .single();

  // PGRST116 == 0 rows returned, which is fine for a new patient
  if (error && error.code !== 'PGRST116') {
    console.error('Error obteniendo antecedentes:', error.message);
    return null;
  }
  return data as AntecedentesMedicos | null;
};

export const saveAntecedentes = async (pacienteId: string, datos: Omit<AntecedentesMedicos, 'id' | 'paciente_id'>): Promise<AntecedentesMedicos | null> => {
  const existente = await getAntecedentes(pacienteId);

  if (existente && existente.id) {
    // Update
    const { data, error } = await supabase
      .from('antecedentes_medicos')
      .update(datos)
      .eq('paciente_id', pacienteId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AntecedentesMedicos;
  } else {
    // Insert
    const { data, error } = await supabase
      .from('antecedentes_medicos')
      .insert([{ paciente_id: pacienteId, ...datos }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AntecedentesMedicos;
  }
};
