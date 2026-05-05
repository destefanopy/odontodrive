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
  return {
    alternates: {
      canonical: `/${params.country.toLowerCase()}`,
    },
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
