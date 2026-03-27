import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { sid, page = 1, pagination = 96, mode = 'sync', totalPages = 1 } = await request.json();
  
  if (!sid) {
    return NextResponse.json({ success: false, error: "SID is required" }, { status: 400 });
  }

  const logs: string[] = [];
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    logs.push(`[${time}] ${msg}`);
  };

  try {
    let updatedCount = 0;
    let newCategoriesCount = 0;

    // Process one page at a time to stay within subrequest limits
    // The frontend handles the loop for multiple pages
    const currentPage = page;
    addLog(`Fetching GamePix Page ${currentPage} (SID: ${sid})...`);
    
    const response = await fetch(`https://feeds.gamepix.com/v2/json?sid=${sid}&page=${currentPage}&pagination=${pagination}`);
    if (!response.ok) {
      throw new Error(`Error fetching page ${currentPage}: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];
    addLog(`Fetched ${items.length} games from page ${currentPage}`);

    if (items.length > 0) {
      // 1. Bulk Handle Categories
      const categoryNames = Array.from(new Set(items.map((i: any) => i.category || 'Uncategorized'))) as string[];
      const categoryData = categoryNames.map(name => ({
        id: crypto.randomUUID(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }));

      const { error: catError } = await supabase
        .from("Category")
        .upsert(categoryData, { onConflict: 'slug' });
      
      if (catError) {
        addLog(`Warning: Error bulk upserting categories: ${catError.message}`);
      }

      // Re-fetch all categories to have a complete map
      const { data: allCategories } = await supabase.from("Category").select("*");
      const categoryMap = new Map(allCategories?.map(c => [c.slug, c]) || []);
      newCategoriesCount = categoryData.length;

      // 2. Bulk Match Games
      const itemNamespaces = items.map((i: any) => i.namespace).filter(Boolean);
      const itemTitles = items.map((i: any) => i.title).filter(Boolean);

      // Fetch existing games by slug and title separately for robustness
      const [{ data: existingBySlug }, { data: existingByTitle }] = await Promise.all([
        supabase.from("Game").select("*").in("slug", itemNamespaces),
        supabase.from("Game").select("*").in("title", itemTitles)
      ]);

      const allExisting = [...(existingBySlug || []), ...(existingByTitle || [])];
      const gameBySlug = new Map(allExisting.map(g => [g.slug, g]));
      const gameByTitle = new Map(allExisting.map(g => [g.title.toLowerCase(), g]));

      const gamesToUpsert: any[] = [];

      for (const item of items as any[]) {
        const categoryName = item.category || 'Uncategorized';
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        const category = categoryMap.get(categorySlug);

        if (!category) continue;

        const existingGame = gameBySlug.get(item.namespace) || gameByTitle.get(item.title.toLowerCase());

        // Prepare iframe URL with SID
        let newUrl = item.url;
        if (!newUrl.includes(`sid=${sid}`)) {
          const separator = newUrl.includes('?') ? '&' : '?';
          newUrl = `${newUrl}${separator}sid=${sid}`;
        }

        const needsUpdate = mode === 'sync_all' || !existingGame || 
                            existingGame.categoryId !== category.id || 
                            !existingGame.iframeUrl?.includes(`sid=${sid}`);

        if (needsUpdate) {
          gamesToUpsert.push({
            id: existingGame?.id || crypto.randomUUID(),
            title: item.title,
            slug: item.namespace || existingGame?.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
            description: item.description || existingGame?.description || "",
            thumbnail: item.banner_image || existingGame?.thumbnail || "",
            iframeUrl: newUrl,
            categoryId: category.id,
            qualityScore: item.quality_score || 0,
            isPublished: true,
            playCount: existingGame?.playCount || 0,
            trendScore: existingGame?.trendScore || Math.random() * 10,
            tags: Array.from(new Set([...(existingGame?.tags || []), categoryName.toLowerCase(), "gamepix"]))
          });
        }
      }

      if (gamesToUpsert.length > 0) {
        addLog(`Bulk upserting ${gamesToUpsert.length} games...`);
        const { error: gameError } = await supabase
          .from("Game")
          .upsert(gamesToUpsert, { onConflict: 'id' });

        if (gameError) {
          addLog(`Error bulk upserting games: ${gameError.message}`);
        } else {
          updatedCount = gamesToUpsert.length;
          addLog(`SUCCESS: Bulk processed ${updatedCount} games.`);
        }
      }
    }

    addLog(`Sync complete. Processed ${updatedCount} games. Created ${newCategoriesCount} categories.`);

    return NextResponse.json({
      success: true,
      logs,
      stats: {
        updated: updatedCount,
        newCategories: newCategoriesCount
      }
    });

  } catch (error: any) {
    addLog(`CRITICAL ERROR: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
