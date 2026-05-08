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
  const { data, error } = await supabase.from('perfiles').select('email, plan, dodo_subscription_id').eq('email', 'payment@gmail.com');
  console.log("PERFILES:", data);
};

main();
