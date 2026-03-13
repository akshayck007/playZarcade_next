import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://playzarcade.com';

  // Fetch all games
  const { data: games } = await supabase
    .from('Game')
    .select('slug, updated_at')
    .eq('isPublished', true);

  // Fetch all categories
  const { data: categories } = await supabase
    .from('Category')
    .select('slug');

  const gameUrls = (games || []).map((game) => ({
    url: `${baseUrl}/game/${game.slug}`,
    lastModified: game.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
    ...gameUrls,
  ];
}
