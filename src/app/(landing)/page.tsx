import { Metadata } from 'next';
import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export const metadata: Metadata = {
  title: "OdontoDrive | Sistema de Gestión Odontológica Premium con IA",
  description: "Descubre el Software Clínico diseñado por Odontólogos para Odontólogos. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube.",
  keywords: ["software odontologico", "gestión dental", "clínica dental en la nube", "odontograma digital", "app odontologia", "historia clinica dental"],
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

export default function GlobalLandingPage() {
  const globalPlans: PricingPlan[] = [
    { name: "Gratis", price: "0", storage: "500 MB", features: ["Gestión de pacientes", "Odontograma interactivo", "Historia clínica digital", "Agenda de turnos", "Emisión de presupuestos", "Sin tarjeta de crédito"] },
    { name: "Básico", price: "4", storage: "1 GB", features: ["Todo lo de Gratis", "Manejo avanzado de pacientes", "Soporte por correo"] },
    { name: "Estándar", price: "10", storage: "5 GB", features: ["Todo lo de Básico", "Odontogramas avanzados", "Recetario digital"] },
    { name: "Avanzado", price: "20", storage: "20 GB", features: ["Todo lo de Estándar", "Análisis fotográfico IA", "Múltiples doctores"], isPopular: true },
    { name: "Premium", price: "30", storage: "40 GB", features: ["Todo lo de Avanzado", "Onboarding completo", "Almacenamiento ultra"] },
  ];

  return (
    <LandingTemplate 
      currencySymbol="US$"
      plans={globalPlans}
      priceSuffix="/mes"
      seoTitle="OdontoDrive | Sistema de Gestión Odontológica Premium con IA"
      seoDescription="Descubre el Software Clínico diseñado por Odontólogos para Odontólogos. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube."
    />
  );
}
