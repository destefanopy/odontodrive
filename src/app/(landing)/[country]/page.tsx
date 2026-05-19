import { notFound } from 'next/navigation';
import { supabase } from '@/infrastructure/supabase';
import LandingTemplate, { PricingPlan } from "@/ui/components/landing/LandingTemplate";

export const revalidate = 60; // 1 minute cache

interface PageProps {
  params: {
    country: string;
  };
}

// Generate static params if we want to pre-render the known routes (optional, but good for SEO)
// Currently, we will just fetch dynamically. 

export async function generateMetadata({ params }: PageProps): Promise<import('next').Metadata> {
  const countrySlug = params.country.toLowerCase();
  let title = `OdontoDrive | Software Dental para ${params.country.toUpperCase()}`;
  let description = `Descubre OdontoDrive en ${params.country.toUpperCase()}. Software clínico, historias odontológicas y odontogramas.`;
  let countryName = params.country;

  try {
    const { data, error } = await supabase
      .from('landing_regiones')
      .select('seo_title, seo_description, country_name')
      .eq('slug', countrySlug)
      .single();

    if (!error && data) {
      if (data.seo_title) title = data.seo_title;
      if (data.seo_description) description = data.seo_description;
      if (data.country_name) countryName = data.country_name;
    }
  } catch (err) {
    console.error("Error fetching regional metadata:", err);
  }

  return {
    title,
    description,
    keywords: [
      `software odontologico ${countryName}`,
      `gestión dental ${countryName}`,
      `programa para clínica dental en ${countryName}`,
      `odontograma digital ${countryName}`,
      `app odontologia ${countryName}`,
      `historias clinicas dentales ${countryName}`,
      `software dental ${countryName}`,
      `sistema para dentistas en ${countryName}`,
      `programa para dentistas ${countryName}`,
      "clínica dental en la nube"
    ],
    alternates: {
      canonical: `/${countrySlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://odontodrive.com/${countrySlug}`
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function DynamicCountryLandingPage({ params }: PageProps) {
  const { country } = params;

  try {
    const { data, error } = await supabase
      .from('landing_regiones')
      .select('*')
      .eq('slug', country.toLowerCase())
      .single();

    if (error || !data) {
      return notFound();
    }

    const plans = Array.isArray(data.planes) ? data.planes as PricingPlan[] : [];

    return (
      <LandingTemplate 
        countryName={data.country_name}
        currencySymbol={data.currency_symbol}
        priceSuffix={data.price_suffix || "/mes"}
        plans={plans}
        seoTitle={data.seo_title}
        seoDescription={data.seo_description}
      />
    );
  } catch (err) {
    console.error("Error fetching dynamic country pricing:", err);
    return notFound();
  }
}
