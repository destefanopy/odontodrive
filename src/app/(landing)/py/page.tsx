import { Metadata } from 'next';
import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export const metadata: Metadata = {
  title: "OdontoDrive Paraguay | Software Odontológico Líder en Py",
  description: "El mejor sistema de gestión para clínicas odontológicas en Paraguay. Historias clínicas, odontogramas y facturación en Guaraníes totalmente en la nube.",
  keywords: ["software odontologico paraguay", "software dental asunción", "clínica dental sistema paraguay", "odontograma py", "facturacion guaranies odontologos", "historia clinica py"],
  openGraph: {
    title: "OdontoDrive Paraguay | Potencia Tu Clínica en Guaraníes",
    description: "Registra cobros, recetarios con SET y presupuestos listos para Paraguay. Comienza tu prueba gratuita hoy.",
    type: "website",
    url: "https://odontodrive.com/py"
  },
  alternates: {
    canonical: "https://odontodrive.com/py"
  }
};

export default function ParaguayLandingPage() {
  const paraguayPlans: PricingPlan[] = [
    { name: "Gratis", price: "0", storage: "500 MB", features: ["Hasta 50 pacientes", "Historia clínica básica", "Agenda clínica"] },
    { name: "Básico", price: "30.000", storage: "1 GB", features: ["Fichas de pacientes", "Presupuestos rápidos", "Soporte por correo"] },
    { name: "Estándar", price: "75.000", storage: "5 GB", features: ["Odontogramas", "Recetas con tu logo", "Gestión de cobros"] },
    { name: "Avanzado", price: "150.000", storage: "20 GB", features: ["Inteligencia Artificial", "Múltiples sucursales", "Soporte vía WhatsApp"], isPopular: true },
    { name: "Premium", price: "225.000", storage: "40 GB", features: ["Todas las funciones", "Capacitación a tu staff", "Tráfico y almacenamiento máximo"] },
  ];

  return (
    <LandingTemplate 
      countryName="Paraguay"
      currencySymbol="Gs."
      plans={paraguayPlans}
      priceSuffix="/mes"
      seoTitle="OdontoDrive Paraguay | Software Odontológico Líder"
      seoDescription="El mejor sistema de gestión para clínicas odontológicas en Paraguay. Historias clínicas, odontogramas y facturación en Guaraníes totalmente en la nube."
    />
  );
}
