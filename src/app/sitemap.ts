import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://playzarcade.com';

  try {
    // Fetch all games
    const { data: games } = await supabase
      .from("Game")
      .select("slug, updatedAt")
      .eq("isPublished", true);

    // Fetch all categories
    const { data: categories } = await supabase
      .from("Category")
      .select("slug");

    // Fetch all SEO pages
    const { data: seoPages } = await supabase
      .from("SeoPage")
      .select("slug");

    const gameEntries = (games || []).map((game) => ({
      url: `${baseUrl}/game/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const categoryEntries = (categories || []).map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const seoEntries = (seoPages || []).map((page) => ({
      url: `${baseUrl}/play/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...gameEntries,
      ...categoryEntries,
      ...seoEntries,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
