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

