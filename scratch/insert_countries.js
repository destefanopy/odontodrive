const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
const supabaseKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/);

const supabaseUrl = supabaseUrlMatch[1].trim().replace(/^['"]|['"]$/g, '');
const supabaseKey = supabaseKeyMatch[1].trim().replace(/^['"]|['"]$/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

const basePlanes = [
  {
    "name": "Gratis",
    "price": 0,
    "storage": "100 MB",
    "features": [
      "Gestión clínica esencial",
      "Odontograma interactivo",
      "Historia clínica digital",
      "Agenda de turnos",
      "Emisión de presupuestos",
      "Sin tarjeta de crédito",
      "15 Consentimientos gratuitos"
    ],
    "isPopular": false,
    "max_patients": 30
  },
  {
    "name": "Básico",
    "price": 5,
    "storage": "1 GB",
    "features": [
      "Gestión para carteras en crecimiento",
      "1 GB de almacenamiento rápido",
      "Consentimientos ilimitados"
    ],
    "isPopular": false,
    "max_patients": 150
  },
  {
    "name": "Estándar",
    "price": 10,
    "storage": "5 GB",
    "features": [
      "Gestión avanzada de alto volumen",
      "5 GB de almacenamiento DICOM",
      "Alerta de deudores"
    ],
    "isPopular": true,
    "max_patients": 300
  },
  {
    "name": "Avanzado",
    "price": 20,
    "storage": "20 GB",
    "features": [
      "Pacientes sin restricciones",
      "20 GB de almacenamiento masivo",
      "Gestión multi-sillón"
    ],
    "isPopular": false,
    "max_patients": 0
  },
  {
    "name": "Premium",
    "price": 30,
    "storage": "40 GB",
    "features": [
      "Libertad clínica absoluta",
      "Onboarding paso a paso",
      "Módulo completo",
      "Gestión de Agenda (Secretaria)"
    ],
    "isPopular": false,
    "max_patients": 0
  }
];

const countries = [
  { slug: 'es', name: 'España', cur: '€', mult: 1, suffix: '/mes' },
  { slug: 'mx', name: 'México', cur: 'MXN$', mult: 20, suffix: '/mes' },
  { slug: 'co', name: 'Colombia', cur: 'COP$', mult: 4000, suffix: '/mes' },
  { slug: 'pe', name: 'Perú', cur: 'S/', mult: 4, suffix: '/mes' },
  { slug: 'cl', name: 'Chile', cur: 'CLP$', mult: 1000, suffix: '/mes' },
  { slug: 'uy', name: 'Uruguay', cur: '$U', mult: 40, suffix: '/mes' },
  { slug: 'bo', name: 'Bolivia', cur: 'Bs', mult: 7, suffix: '/mes' },
  { slug: 've', name: 'Venezuela', cur: 'US$', mult: 1, suffix: '/mes' },
  { slug: 'cr', name: 'Costa Rica', cur: '₡', mult: 500, suffix: '/mes' },
  { slug: 'pa', name: 'Panamá', cur: 'US$', mult: 1, suffix: '/mes' },
  { slug: 'do', name: 'Rep. Dominicana', cur: 'RD$', mult: 60, suffix: '/mes' },
  { slug: 'hn', name: 'Honduras', cur: 'L', mult: 25, suffix: '/mes' },
  { slug: 'gt', name: 'Guatemala', cur: 'Q', mult: 8, suffix: '/mes' },
  { slug: 'sv', name: 'El Salvador', cur: 'US$', mult: 1, suffix: '/mes' },
  { slug: 'ni', name: 'Nicaragua', cur: 'C$', mult: 36, suffix: '/mes' },
  { slug: 'cu', name: 'Cuba', cur: 'US$', mult: 1, suffix: '/mes' },
  { slug: 'pr', name: 'Puerto Rico', cur: 'US$', mult: 1, suffix: '/mes' }
];

async function insertCountries() {
  for (const c of countries) {
    const planesWithPrices = basePlanes.map(p => ({
      ...p,
      price: p.price === 0 ? "0" : (p.price * c.mult).toLocaleString('es-ES').replace(',','.') // Format simple (1000 or 10.000)
    }));

    const seoTitle = `OdontoDrive | Software Dental y Odontograma en ${c.name}`;
    const seoDescription = `Descubre OdontoDrive, el mejor software clínico diseñado por Odontólogos en ${c.name}. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube.`;

    const payload = {
      slug: c.slug,
      country_name: c.name,
      currency_symbol: c.cur,
      price_suffix: c.suffix,
      seo_title: seoTitle,
      seo_description: seoDescription,
      planes: planesWithPrices
    };

    const { error } = await supabase
      .from('landing_regiones')
      .upsert(payload, { onConflict: 'slug' });
      
    if (error) {
      console.error(`Error inserting ${c.name}:`, error.message);
    } else {
      console.log(`Successfully inserted ${c.name}`);
    }
  }
}

insertCountries();
