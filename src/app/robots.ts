import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/login', '/interno'],
    },
    sitemap: 'https://www.odontodrive.com/sitemap.xml',
  };
}
