import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

const GAMEPIX_SID = "ZA727";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const pagination = searchParams.get('pagination') || '50';

  try {
    const url = `https://feeds.gamepix.com/v2/json?sid=${GAMEPIX_SID}&pagination=${pagination}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PlayZ-Arcade-Sync/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GamePix API responded with ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.data || []);

    let syncedCount = 0;
    for (const gp of items) {
      const slug = gp.namespace || gp.id || gp.slug;
      if (!slug) continue;

      const title = gp.title || gp.name || "Untitled Game";
      const description = gp.description || gp.desc || "No description available.";
      const categoryName = gp.category || gp.genre || "Casual";
      const thumbnail = gp.banner_image || gp.image || gp.thumbnailUrl || "https://picsum.photos/seed/game/800/600";
      const iframeUrl = gp.url || gp.iframeUrl;

      if (!iframeUrl) continue;

      // Find or create category
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
      let { data: category } = await supabase
        .from("Category")
        .select("*")
        .eq("slug", categorySlug)
        .single();

      if (!category) {
        const { data: newCat } = await supabase
          .from("Category")
          .insert({
            id: crypto.randomUUID(),
            name: categoryName,
            slug: categorySlug
          })
          .select()
          .single();
        category = newCat;
      }

      if (!category) continue;

      await supabase
        .from("Game")
        .upsert({
          slug: String(slug),
          title: String(title),
          description: String(description),
          thumbnail: String(thumbnail),
          iframeUrl: String(iframeUrl),
          categoryId: category.id,
          qualityScore: gp.quality_score || 0,
          tags: [categoryName.toLowerCase(), "gamepix"],
          trendScore: Math.random() * 100,
        }, { onConflict: 'slug' });
      
      syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      synced: syncedCount,
      page: parseInt(page),
      pagination: parseInt(pagination)
    });

  } catch (error: any) {
    console.error("[SYNC ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
