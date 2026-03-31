import LandingTemplate from "@/ui/components/landing/LandingTemplate";

export default function GlobalLandingPage() {
  return (
    <LandingTemplate 
      currencySymbol="US$"
      price="19"
      priceSuffix="/mes"
      seoTitle="OdontoDrive | Sistema de Gestión Odontológica Premium con IA"
      seoDescription="Descubre el Software Clínico diseñado por Odontólogos para Odontólogos. Historias clínicas, odontograma cruzado y gestión financiera sencilla en la nube."
    />
  );
}
