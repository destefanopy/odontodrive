import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export default function ArgentinaLandingPage() {
  const argentinaPlans: PricingPlan[] = [
    { name: "Gratis", price: "0", storage: "500 MB", features: ["Hasta 50 pacientes", "Historia clínica básica", "Agenda clínica"] },
    { name: "Básico", price: "4.000", storage: "1 GB", features: ["Agenda clínica", "Presupuestos ágiles", "Soporte vía email"] },
    { name: "Estándar", price: "10.000", storage: "5 GB", features: ["Odontogramas completos", "Recetario corporativo", "Alerta de deudores"] },
    { name: "Avanzado", price: "20.000", storage: "20 GB", features: ["Análisis IA fotográfico", "Gestión multi-sillón", "Atención prioritaria"], isPopular: true },
    { name: "Premium", price: "30.000", storage: "40 GB", features: ["Módulo completo", "Onboarding paso a paso", "Espacio para miles de imágenes"] },
  ];

  return (
    <LandingTemplate 
      countryName="Argentina"
      currencySymbol="ARS"
      plans={argentinaPlans}
      priceSuffix="/mes"
      seoTitle="OdontoDrive Argentina | #1 en Gestión de Consultorios"
      seoDescription="Sistema Odontológico Avanzado. Evoluciona tu consultorio en Argentina con historias clínicas digitales, odontograma en tiempo real y cotizaciones fáciles de usar."
    />
  );
}
