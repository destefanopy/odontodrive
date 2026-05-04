require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('citas').select('*').limit(1);
  console.log('Citas Data:', data);
  console.log('Citas Error:', error);

  // Let's try to insert a cita without paciente_id
  const testCita = {
    nombre_paciente: 'TEST TAREA',
    motivo: 'test',
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date().toISOString()
  };
  const { data: iData, error: iError } = await supabase.from('citas').insert([testCita]).select();
  console.log('Insert Data:', iData);
  console.log('Insert Error:', iError);
}

check();
