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

export interface Cita {
  id?: string;
  paciente_id: string;
  nombre_paciente: string;
  motivo: string;
  fecha_inicio: string; // ISO String
  fecha_fin: string;    // ISO String
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
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const fechaIngreso = new Date().toISOString(); 
  const { data: newPaciente, error } = await supabase
    .from('pacientes')
    .insert([{ ...data, fecha_ingreso: fechaIngreso, user_id: authData.user.id }])
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

export const getOdontograma = async (pacienteId: string): Promise<Record<number, any>> => {
  const { data, error } = await supabase
    .from('odontograma_registros')
    .select('pieza_dental, estado')
    .eq('paciente_id', pacienteId);

  if (error) {
    console.error('Error obteniendo odontograma:', error.message);
    return {};
  }

  const result: Record<number, any> = {};
  if (data) {
    data.forEach(item => {
      // Mapeamos a Record<number, any> (Ej: { 18: { top: 'caries' } })
      result[item.pieza_dental] = item.estado;
    });
  }
  return result;
};

export const saveOdontograma = async (pacienteId: string, registros: Record<number, any>): Promise<boolean> => {
  // Estrategia Vibe Atómico: Descartamos el estado anterior y persistimos el nuevo completo para evitar comprobaciones complejas de deltas.
  const { error: deleteError } = await supabase
    .from('odontograma_registros')
    .delete()
    .eq('paciente_id', pacienteId);

  if (deleteError) {
    console.error('Error limpiando odontograma anterior:', deleteError.message);
    throw new Error(deleteError.message);
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const arrParaInsertar = Object.entries(registros).map(([pieza, estado]) => ({
    paciente_id: pacienteId,
    pieza_dental: parseInt(pieza, 10),
    estado: estado,
    user_id: authData.user.id
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
    const { data: authData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('antecedentes_medicos')
      .insert([{ paciente_id: pacienteId, user_id: authData.user?.id, ...datos }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AntecedentesMedicos;
  }
};

/**
 * API DE AGENDA Y CITAS
 */

export const getCitas = async (): Promise<Cita[]> => {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('fecha_inicio', { ascending: true });

  if (error) {
    if (error.code !== '42P01') { // 42P01 is "undefined_table"
      console.warn('Error buscando citas:', error.message);
    }
    return [];
  }
  return data as Cita[];
};

export async function createCita(cita: Omit<Cita, "id" | "created_at">) {
  const { data: authData } = await supabase.auth.getUser();
  const { error } = await supabase.from("citas").insert({ ...cita, user_id: authData.user?.id });
  
  if (error) {
    console.error("Error al agendar cita:", error.message);
    throw new Error("No se pudo agendar la cita en la base de datos.");
  }
}

export async function deleteCita(id: string) {
  const { error } = await supabase.from("citas").delete().eq("id", id);
  
  if (error) {
    console.error("Error al borrar cita:", error.message);
    throw new Error("No se pudo borrar la cita en la base de datos.");
  }
};

export async function deletePaciente(pacienteId: string) {
  const { error } = await supabase.rpc('eliminar_paciente_cascade', {
    target_paciente_id: pacienteId
  });

  if (error) {
    console.error("Error eliminando paciente:", error.message);
    throw new Error(error.message);
  }
  return true;
}

/**
 * API DE ARCHIVOS E IA (Storage)
 */

export interface DocumentoPaciente {
  id: string;
  paciente_id: string;
  url_archivo: string;
  tipo_archivo: string;
  fase_clinica: 'antes' | 'evolucion' | 'final' | 'ninguna';
  fecha_subida: string;
  texto_extraido?: string;
  analisis_ia?: any;
  user_id: string;
  signedUrl?: string; // Generado en tiempo de ejecución
}

export const uploadPacienteFile = async (
  pacienteId: string, 
  file: File, 
  tipo: string, 
  fase: string
): Promise<DocumentoPaciente> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${pacienteId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // 1. Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('pacientes_archivos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Insert into DB
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from('documentos_paciente')
    .insert({
      paciente_id: pacienteId,
      url_archivo: filePath,
      tipo_archivo: tipo,
      fase_clinica: fase,
      user_id: authData.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error insertando documento:', error.message);
    throw new Error(error.message);
  }
  
  return data as DocumentoPaciente;
}

export const getPacienteFiles = async (pacienteId: string): Promise<DocumentoPaciente[]> => {
  const { data, error } = await supabase
    .from('documentos_paciente')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_subida', { ascending: false });

  if (error) {
    if (error.code !== '42P01') { 
      console.error('Error obteniendo archivos:', error.message);
    }
    return [];
  }
  
  const filesWithUrls = await Promise.all(
    (data || []).map(async (doc) => {
      if (doc.url_archivo.startsWith('http')) {
        return { ...doc, signedUrl: doc.url_archivo };
      }

      const { data: urlData } = await supabase.storage
        .from('pacientes_archivos')
        .createSignedUrl(doc.url_archivo, 3600);
        
      return {
        ...doc,
        signedUrl: urlData?.signedUrl || null
      };
    })
  );

  return filesWithUrls as DocumentoPaciente[];
}

export async function deletePacienteFile(id: string, storagePath: string) {
  if (!storagePath.startsWith('http')) {
    await supabase.storage.from('pacientes_archivos').remove([storagePath]);
  }
  const { error } = await supabase.from('documentos_paciente').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updatePacienteFileFase(id: string, fase: string) {
  const { error } = await supabase
    .from('documentos_paciente')
    .update({ fase_clinica: fase })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

export async function analyzeImagesWithAI(signedUrls: string[], customPrompt?: string): Promise<string> {
  const req = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrls: signedUrls,
      prompt: customPrompt
    })
  });

  const res = await req.json();
  if (!req.ok) {
    throw new Error(res.error || "Error al conectar con OdontólogoIA.");
  }
  
  return res.result;
}

/**
 * API DE FINANZAS Y PAGOS
 */

export interface Pago {
  id: string;
  paciente_id: string;
  monto: number;
  metodo_pago: string;
  concepto: string;
  fecha_pago: string;
  user_id: string;
  pacientes?: { nombres_apellidos: string };
}

export async function createPago(pago: Omit<Pago, 'id' | 'fecha_pago' | 'user_id' | 'pacientes'>) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const { error } = await supabase.from('pagos').insert({ ...pago, user_id: authData.user.id });
  if (error) throw new Error(error.message);
  return true;
}

export async function getPagos(pacienteId?: string): Promise<Pago[]> {
  let query = supabase.from('pagos').select('*, pacientes(nombres_apellidos)');
  
  if (pacienteId) {
    query = query.eq('paciente_id', pacienteId);
  }
  
  const { data, error } = await query.order('fecha_pago', { ascending: false });
  if (error && error.code !== '42P01') {
    console.error("Error obteniendo pagos:", error.message);
    return [];
  }
  return (data || []) as Pago[];
}

export async function deletePago(id: string) {
  const { error } = await supabase.from('pagos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
