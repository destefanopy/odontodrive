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
  foto_url?: string | null;
}

export const uploadProfilePicture = async (pacienteId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `perfiles/${pacienteId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('pacientes_archivos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: signError } = await supabase.storage
    .from('pacientes_archivos')
    .createSignedUrl(filePath, 31536000); // 1 año de validez para caché si es posible
    
  if (signError || !data?.signedUrl) throw new Error("No se pudo obtener la URL de la foto");

  await updatePacienteData(pacienteId, { foto_url: data.signedUrl });
  return data.signedUrl;
};

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
 * Obtiene tódos los pacientes registrados, ordenados alfabéticamente para el directorio.
 */
export const getTodosLosPacientes = async (): Promise<Paciente[]> => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('nombres_apellidos', { ascending: true });

  if (error) {
    console.error('Error obteniendo todos los pacientes:', error.message);
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

  // Verify plan limit
  const { data: perfil } = await supabase.from('perfiles').select('plan').eq('id', authData.user.id).single();
  const plan = perfil?.plan || 'free';
  
  if (plan === 'free') {
    const { count } = await supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', authData.user.id);
    if (count !== null && count >= 50) {
      throw new Error("Límite de pacientes alcanzado. Por favor, pásate al plan Básico o superior para registrar más (pacientes ilimitados).");
    }
  }

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

export const getOdontograma = async (pacienteId: string, tipo: 'inicial' | 'final' = 'inicial'): Promise<Record<number, any>> => {
  const { data, error } = await supabase
    .from('odontograma_registros')
    .select('pieza_dental, estado')
    .eq('paciente_id', pacienteId)
    .eq('tipo_registro', tipo);

  if (error) {
    console.error('Error obteniendo odontograma:', error.message);
    return {};
  }

  const result: Record<number, any> = {};
  if (data) {
    data.forEach(item => {
      let parsedEstado = item.estado;
      if (typeof item.estado === 'string') {
        try {
          // Verify if it is valid JSON (ToothSurfaces object)
          const attempt = JSON.parse(item.estado);
          if (typeof attempt === 'object' && attempt !== null) {
            parsedEstado = attempt;
          }
        } catch(e) {
          // If it fails to parse, it means it's the old format (e.g., "caries")
          // Leave it as string and let `migrateInitial` handle it
        }
      }
      result[item.pieza_dental] = parsedEstado;
    });
  }
  return result;
};

export const saveOdontograma = async (pacienteId: string, registros: Record<number, any>, tipo: 'inicial' | 'final' = 'inicial'): Promise<boolean> => {
  // Estrategia Vibe Atómico: Descartamos el estado anterior y persistimos el nuevo completo para evitar comprobaciones complejas de deltas.
  const { error: deleteError } = await supabase
    .from('odontograma_registros')
    .delete()
    .eq('paciente_id', pacienteId)
    .eq('tipo_registro', tipo);

  if (deleteError) {
    console.error('Error limpiando odontograma anterior:', deleteError.message);
    throw new Error(deleteError.message);
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const arrParaInsertar = Object.entries(registros).map(([pieza, estado]) => ({
    paciente_id: pacienteId,
    pieza_dental: parseInt(pieza, 10),
    estado: JSON.stringify(estado),
    tipo_registro: tipo,
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
  ultima_consulta_odontologica?: string | null;
  ultima_consulta_medica?: string | null;
  complicaciones_hemorragias?: string | null;
  habitos_viciosos?: string | null;
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
}

export async function updateCita(id: string, updates: Partial<Cita>) {
  const { error } = await supabase.from("citas").update(updates).eq("id", id);
  if (error) {
    console.error("Error al actualizar cita:", error.message);
    throw new Error("No se pudo actualizar la cita.");
  }
}

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
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  let sizeInBytes = 0;
  if (!storagePath.startsWith('http')) {
    // Intentamos obtener el tamaño antes de borrar
    const pathParts = storagePath.split('/');
    if (pathParts.length > 1) {
       const { data: fileInfo, error: listError } = await supabase.storage.from('pacientes_archivos').list(pathParts[0], { search: pathParts[1] });
       console.log("Storage list result:", fileInfo, listError);
       if (fileInfo && fileInfo.length > 0) {
          sizeInBytes = fileInfo[0].metadata?.size || 0;
          console.log("File size found:", sizeInBytes);
       } else {
          console.log("File not found in list. Searched for:", pathParts[1], "in dir:", pathParts[0]);
       }
    }
    await supabase.storage.from('pacientes_archivos').remove([storagePath]);
  }
  
  const { error } = await supabase.from('documentos_paciente').delete().eq('id', id);
  if (error) throw new Error(error.message);
  
  // Restamos el uso
  if (sizeInBytes > 0) {
      const { data: perfil } = await supabase.from('perfiles').select('storage_usado_bytes').eq('id', authData.user.id).single();
      const currentStorage = perfil?.storage_usado_bytes || 0;
      const newStorage = Math.max(0, currentStorage - sizeInBytes);
      console.log(`Updating storage from ${currentStorage} to ${newStorage} for user ${authData.user.id}`);
      const { error: updateError } = await supabase.from('perfiles').update({ storage_usado_bytes: newStorage }).eq('id', authData.user.id);
      if (updateError) console.error("Error updating profile storage:", updateError);
  } else {
      console.log("sizeInBytes is 0, skipping storage update.");
  }

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

export async function incrementIaUsage() {
  const { data: authData } = await supabase.auth.getUser();
  if (authData?.user) {
    await supabase.rpc('increment_ia_usage', { target_user_id: authData.user.id });
  }
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
  
  await incrementIaUsage();
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

export async function createPago(pago: Omit<Pago, 'id' | 'user_id' | 'pacientes' | 'fecha_pago'> & { fecha_pago?: string }) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const payload = {
    ...pago,
    fecha_pago: pago.fecha_pago || new Date().toISOString(),
    user_id: authData.user.id
  };

  const { error } = await supabase.from('pagos').insert(payload);
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

export async function updatePago(id: string, updates: Partial<Pago>) {
  const { error } = await supabase.from('pagos').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export interface Deuda {
  id: string;
  paciente_id: string;
  monto: number;
  concepto: string;
  fecha: string;
  user_id: string;
  pacientes?: { nombres_apellidos: string };
}

export async function createDeuda(deuda: Omit<Deuda, 'id' | 'user_id' | 'pacientes' | 'fecha'> & { fecha?: string }) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const payload = {
    ...deuda,
    fecha: deuda.fecha || new Date().toISOString(),
    user_id: authData.user.id
  };

  const { error } = await supabase.from('deudas').insert(payload);
  if (error) throw new Error(error.message);
  return true;
}

export async function getDeudas(pacienteId?: string): Promise<Deuda[]> {
  let query = supabase.from('deudas').select('*, pacientes(nombres_apellidos)');
  if (pacienteId) {
    query = query.eq('paciente_id', pacienteId);
  }
  const { data, error } = await query.order('fecha', { ascending: false });
  if (error && error.code !== '42P01') {
    console.error("Error obteniendo deudas:", error.message);
    return [];
  }
  return (data || []) as Deuda[];
}

export async function deleteDeuda(id: string) {
  const { error } = await supabase.from('deudas').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateDeuda(id: string, updates: Partial<Deuda>) {
  const { error } = await supabase.from('deudas').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/**
 * API DE PRESUPUESTOS (Historial Interactivo)
 */

export interface PresupuestoDB {
  id: string;
  paciente_id: string;
  user_id: string;
  items: any;
  descuento: number;
  subtotal: number;
  total: number;
  created_at: string;
}

export async function createPresupuesto(data: Omit<PresupuestoDB, 'id' | 'user_id' | 'created_at'>) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const { data: newRecord, error } = await supabase.from('presupuestos').insert({
    ...data,
    user_id: authData.user.id
  }).select().single();

  if (error) throw new Error(error.message);
  return newRecord as PresupuestoDB;
}

export async function getPresupuestos(pacienteId: string): Promise<PresupuestoDB[]> {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });

  if (error && error.code !== '42P01') {
    console.error("Error obteniendo presupuestos:", error.message);
    return [];
  }
  return (data || []) as PresupuestoDB[];
}

export async function deletePresupuesto(id: string) {
  const { error } = await supabase.from('presupuestos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updatePresupuesto(id: string, data: Partial<Omit<PresupuestoDB, 'id' | 'user_id' | 'created_at'>>) {
  const { data: updatedRecord, error } = await supabase.from('presupuestos').update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return updatedRecord as PresupuestoDB;
}

/**
 * API DE RECETAS (Historial)
 */

export interface RecetaDB {
  id: string;
  paciente_id: string;
  user_id: string;
  medicamentos: any;
  created_at: string;
}

export async function createReceta(data: Omit<RecetaDB, 'id' | 'user_id' | 'created_at'>) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const { data: newRecord, error } = await supabase.from('recetas').insert({
    ...data,
    user_id: authData.user.id
  }).select().single();

  if (error) throw new Error(error.message);
  return newRecord as RecetaDB;
}

export async function getRecetas(pacienteId: string): Promise<RecetaDB[]> {
  const { data, error } = await supabase
    .from('recetas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });

  if (error && error.code !== '42P01') {
    console.error("Error obteniendo recetas:", error.message);
    return [];
  }
  return (data || []) as RecetaDB[];
}

export async function deleteReceta(id: string) {
  const { error } = await supabase.from('recetas').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateReceta(id: string, data: Partial<Omit<RecetaDB, 'id' | 'user_id' | 'created_at'>>) {
  const { data: updatedRecord, error } = await supabase.from('recetas').update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return updatedRecord as RecetaDB;
}

