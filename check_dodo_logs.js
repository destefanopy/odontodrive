const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    envVars[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

const main = async () => {
  // Get last 5 logs from dodo_logs
  const { data, error } = await supabase.from('dodo_logs').select('*').order('created_at', { ascending: false }).limit(5);
  
  if (error) {
    console.error("Error fetching", error);
    return;
  }

  for (const log of data) {
    console.log("LOG ENTRY:");
    console.log(JSON.stringify(log, null, 2));
    console.log("-----------------------------------------");
  }
};

main();
