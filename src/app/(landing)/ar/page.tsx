import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export default function ArgentinaLandingPage() {
  const argentinaPlans: PricingPlan[] = [
    { name: "Gratis", price: "0", storage: "500 MB", features: ["Gestión de hasta 50 pacientes", "Odontograma interactivo", "Historia clínica digital", "Agenda de turnos", "Emisión de presupuestos", "Sin tarjeta de crédito"] },
    { name: "Básico", price: "4.000", storage: "1 GB", features: ["Todo lo de Gratis", "Pacientes ilimitados", "Soporte vía email"] },
    { name: "Estándar", price: "10.000", storage: "5 GB", features: ["Todo lo de Básico", "Recetario corporativo", "Alerta de deudores"] },
    { name: "Avanzado", price: "20.000", storage: "20 GB", features: ["Todo lo de Estándar", "Análisis fotográfico IA", "Gestión multi-sillón"], isPopular: true },
    { name: "Premium", price: "30.000", storage: "40 GB", features: ["Todo lo de Avanzado", "Onboarding paso a paso", "Módulo completo"] },
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
