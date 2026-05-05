import { MetadataRoute } from 'next';
import { supabase } from '@/infrastructure/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.odontodrive.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/precios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  // Fetch dynamic regional pages
  let regionalRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: regiones } = await supabase
      .from('landing_regiones')
      .select('slug');
      
    if (regiones) {
      regionalRoutes = regiones.map((region) => ({
        url: `${baseUrl}/${region.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9, // high priority for regional landings
      }));
    }
  } catch (err) {
    console.error("Error fetching sitemap regiones:", err);
  }

  // Fetch dynamic blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: noticias } = await supabase
      .from('noticias')
      .select('slug, created_at')
      .eq('is_published', true);
      
    if (noticias) {
      blogRoutes = noticias.map((noticia) => ({
        url: `${baseUrl}/blog/${noticia.slug}`,
        lastModified: new Date(noticia.created_at),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Error fetching sitemap noticias:", err);
  }

  return [...staticRoutes, ...regionalRoutes, ...blogRoutes];
}
