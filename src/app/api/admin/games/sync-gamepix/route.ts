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

    for (let currentPage = page; currentPage < page + totalPages; currentPage++) {
      addLog(`Fetching GamePix Page ${currentPage} (SID: ${sid})...`);
      
      // Use the standard GamePix JSON feed URL structure
      const response = await fetch(`https://feeds.gamepix.com/v2/json?sid=${sid}&page=${currentPage}&pagination=${pagination}`);
      if (!response.ok) {
        addLog(`Error fetching page ${currentPage}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const items = data.items || [];
      addLog(`Fetched ${items.length} games from page ${currentPage}`);

      if (items.length === 0) break;

      // 1. Pre-fetch all categories for this page
      const categoryNames = Array.from(new Set(items.map((i: any) => i.category || 'Uncategorized'))) as string[];
      const categorySlugs = categoryNames.map(name => name.toLowerCase().replace(/\s+/g, '-'));
      
      const { data: existingCategories } = await supabase
        .from("Category")
        .select("*")
        .in("slug", categorySlugs);
      
      const categoryMap = new Map(existingCategories?.map(c => [c.slug, c]) || []);

      // 2. Pre-fetch all games for this page to see what exists
      const itemNamespaces = items.map((i: any) => i.namespace);
      const itemIds = items.map((i: any) => i.id);
      const itemTitles = items.map((i: any) => i.title);

      // We'll still do some matching, but let's try to get a bulk set first
      const { data: existingGames } = await supabase
        .from("Game")
        .select("id, title, slug, categoryId, tags, description, thumbnail, iframeUrl")
        .or(`slug.in.(${itemNamespaces.join(',')}),slug.in.(${itemIds.join(',')})`);

      const gameMap = new Map(existingGames?.map(g => [g.slug, g]) || []);

      for (const item of items as any[]) {
        // 1. Handle Category
        const categoryName = item.category || 'Uncategorized';
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        let category = categoryMap.get(categorySlug);

        if (!category) {
          addLog(`Creating new category: ${categoryName}`);
          // Use upsert with onConflict slug to be consistent with seed
          // Also provide a random UUID for the ID in case the DB doesn't generate it automatically
          const { data: newCat, error: catError } = await supabase
            .from("Category")
            .upsert({ 
              id: crypto.randomUUID(),
              name: categoryName, 
              slug: categorySlug 
            }, { onConflict: 'slug' })
            .select()
            .single();
          
          if (catError) {
            addLog(`Error creating category ${categoryName}: ${catError.message}`);
            continue;
          }
          category = newCat;
          categoryMap.set(categorySlug, category);
          newCategoriesCount++;
        }

        // 2. Find and Update Game
        let existingGame = gameMap.get(item.namespace) || gameMap.get(item.id);

        if (!existingGame) {
          // Fallback to title match if slug didn't work (more expensive, so we do it individually if needed)
          const escapedTitle = `"%${item.title}%"`;
          const { data: titleMatches } = await supabase
            .from("Game")
            .select("id, title, slug, categoryId, tags, description, thumbnail, iframeUrl")
            .ilike("title", item.title)
            .limit(1);
          
          if (titleMatches && titleMatches.length > 0) {
            existingGame = titleMatches[0];
          }
        }

        if (existingGame) {
          // Update SID in URL and Category
          let newUrl = item.url;
          if (!newUrl.includes(`sid=${sid}`)) {
            const separator = newUrl.includes('?') ? '&' : '?';
            newUrl = `${newUrl}${separator}sid=${sid}`;
          }
          
          // Only update if something changed or if we are in sync_all mode
          const needsUpdate = mode === 'sync_all' || 
                              existingGame.categoryId !== category.id || 
                              !existingGame.iframeUrl?.includes(`sid=${sid}`);

          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from("Game")
              .update({
                iframeUrl: newUrl,
                categoryId: category.id,
                description: existingGame.description || item.description,
                thumbnail: existingGame.thumbnail || item.banner_image,
                qualityScore: item.quality_score || 0,
                tags: Array.from(new Set([...(existingGame.tags || []), categoryName.toLowerCase(), "gamepix"]))
              })
              .eq("id", existingGame.id);

            if (updateError) {
              addLog(`Error updating game ${item.title}: ${updateError.message}`);
            } else {
              addLog(`SUCCESS: Updated ${item.title} -> ${categoryName}`);
              updatedCount++;
            }
          }
        } else {
          if (mode === 'sync_all') {
            // Create new game if it doesn't exist
            addLog(`Creating new game: ${item.title}`);
            const { error: insertError } = await supabase
              .from("Game")
              .upsert({
                id: crypto.randomUUID(),
                title: item.title,
                slug: item.namespace,
                description: item.description,
                thumbnail: item.banner_image,
                iframeUrl: item.url.includes('?') ? `${item.url}&sid=${sid}` : `${item.url}?sid=${sid}`,
                categoryId: category.id,
                qualityScore: item.quality_score || 0,
                isPublished: true,
                playCount: 0,
                trendScore: Math.random() * 10,
                tags: [categoryName.toLowerCase(), "gamepix"]
              }, { onConflict: 'slug' });
            
            if (insertError) {
              addLog(`Error creating game ${item.title}: ${insertError.message}`);
            } else {
              updatedCount++;
            }
          }
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
