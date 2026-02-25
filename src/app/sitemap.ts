import { MetadataRoute } from 'next';

const DOMAIN_NAME = process.env.DOMAIN_NAME || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: DOMAIN_NAME,
      lastModified: new Date(),
    },
    // Add more routes as needed
  ];
}
