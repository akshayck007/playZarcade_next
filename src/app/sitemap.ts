import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://playzarcade.com';

  // Fetch games - limiting to 5,000 most recent to improve response time
  const { data: games } = await supabase
    .from('Game')
    .select('slug, updated_at')
    .eq('isPublished', true)
    .order('updated_at', { ascending: false })
    .limit(5000);

  // Fetch all categories
  const { data: categories } = await supabase
    .from('Category')
    .select('slug');

  // Fetch all SEO pages
  const { data: seoPages } = await supabase
    .from('SeoPage')
    .select('slug');

  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/privacy-policy', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/terms-of-service', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/cookie-policy', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/recently-played', priority: 0.4, changeFrequency: 'daily' as const },
  ].map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const gameUrls = (games || []).map((game) => ({
    url: `${baseUrl}/game/${game.slug}`,
    lastModified: game.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const seoUrls = (seoPages || []).map((page) => ({
    url: `${baseUrl}/play/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const categoryUrls = (categories || []).map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryUrls,
    ...gameUrls,
    ...seoUrls,
  ];
}
