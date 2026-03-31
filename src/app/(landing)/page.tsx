import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export default function GlobalLandingPage() {
  const globalPlans: PricingPlan[] = [
    { name: "Básico", price: "4", storage: "1 GB", features: ["Gestión pacientes básica", "Presupuestos estándar", "Soporte por correo"] },
    { name: "Estándar", price: "10", storage: "5 GB", features: ["Odontogramas interactivos", "Recetario digital", "Recordatorios de pago"] },
    { name: "Avanzado", price: "20", storage: "20 GB", features: ["Análisis fotográfico IA", "Múltiples doctores", "Soporte prioritario"], isPopular: true },
    { name: "Premium", price: "30", storage: "40 GB", features: ["Acceso total vitalicio", "Onboarding completo", "Almacenamiento ultra"] },
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
