import { MetadataRoute } from 'next';

const DOMAIN_NAME = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: DOMAIN_NAME,
      lastModified: new Date(),
    },
    // Add more routes as needed
  ];
}
