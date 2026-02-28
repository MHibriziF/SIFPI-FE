import { MetadataRoute } from 'next';

const DOMAIN_NAME = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${DOMAIN_NAME}/sitemap.xml`,
  };
}
