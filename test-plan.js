const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = `${supabaseUrlMatch[1].trim().replace(/"/g, '')}/rest/v1/perfiles?email=eq.destefanopy@gmail.com&select=email,plan`;

fetch(url, {
  headers: {
    'apikey': supabaseKeyMatch[1].trim().replace(/"/g, ''),
    'Authorization': `Bearer ${supabaseKeyMatch[1].trim().replace(/"/g, '')}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
