import { Metadata } from 'next';
import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";
import { supabase } from '@/infrastructure/supabase';

export const revalidate = 60; // 1 minute cache

export const metadata: Metadata = {
  title: "OdontoDrive | Sistema de Gestión Odontológica Premium con IA",
  description: "Descubre el Software Clínico diseñado por Odontólogos para Odontólogos. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube.",
  keywords: ["software odontologico", "gestión dental", "clínica dental en la nube", "odontograma digital", "app odontologia", "historia clinica dental"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "OdontoDrive | Evoluciona Tu Práctica Dental",
    description: "Gestión completa, facturación y odontogramas respaldados por Inteligencia Artificial en una sola plataforma.",
    type: "website",
    url: "https://odontodrive.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "OdontoDrive",
    description: "La herramienta SaaS definitiva para administrar de punta a punta tu clínica dental."
  }
};

export default async function GlobalLandingPage() {
  const globalPlans: PricingPlan[] = [
    { name: "Gratis", price: "0", storage: "500 MB", features: ["Gestión de pacientes", "Odontograma interactivo", "15 Consentimientos gratuitos", "Agenda de turnos", "Sin tarjeta de crédito"] },
    { name: "Básico", price: "4", storage: "1 GB", features: ["Todo lo de Gratis", "Manejo avanzado de pacientes", "Consentimientos ilimitados", "Soporte por correo"] },
    { name: "Estándar", price: "10", storage: "5 GB", features: ["Todo lo de Básico", "Odontogramas avanzados", "Recetario digital"] },
    { name: "Avanzado", price: "20", storage: "20 GB", features: ["Todo lo de Estándar", "Análisis fotográfico IA", "Múltiples doctores"], isPopular: true },
    { name: "Premium", price: "30", storage: "40 GB", features: ["Todo lo de Avanzado", "Onboarding completo", "Almacenamiento ultra"] },
  ];

  let activePlans = globalPlans;
  let currency = "US$";
  let suffix = "/mes";
  let seoTitle = "OdontoDrive | Sistema de Gestión Odontológica Premium con IA";
  let seoDesc = "Descubre el Software Clínico diseñado por Odontólogos para Odontólogos. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube.";

  try {
    const { data, error } = await supabase
      .from('landing_regiones')
      .select('*')
      .eq('slug', 'global')
      .single();

    if (!error && data) {
      if (Array.isArray(data.planes) && data.planes.length > 0) {
        activePlans = data.planes as PricingPlan[];
      }
      if (data.currency_symbol) currency = data.currency_symbol;
      if (data.price_suffix) suffix = data.price_suffix;
      if (data.seo_title) seoTitle = data.seo_title;
      if (data.seo_description) seoDesc = data.seo_description;
    }
  } catch (err) {
    console.error("Error fetching global pricing:", err);
  }

  return (
    <LandingTemplate 
      currencySymbol={currency}
      plans={activePlans}
      priceSuffix={suffix}
      seoTitle={seoTitle}
      seoDescription={seoDesc}
    />
  );
}
