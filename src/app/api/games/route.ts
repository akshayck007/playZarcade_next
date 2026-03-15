import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

// Using Edge Runtime for Cloudflare Pages
export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories = searchParams.get('categories')?.split(',').filter(Boolean);
  const q = searchParams.get('q');
  const sort = searchParams.get('sort') || 'trendScore';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
      .from("Game")
      .select("*, Category(name, slug)")
      .eq("isPublished", true);

    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    if (categories && categories.length > 0) {
      // Expand categories to handle both 'action' and 'action-games' patterns
      const expandedCategories = Array.from(new Set(
        categories.flatMap(c => [
          c, 
          c.endsWith('-games') ? c : `${c}-games`,
          c.replace(/-games$/, '')
        ])
      ));
      
      // Fetch category IDs first to filter more reliably
      const { data: catData } = await supabase
        .from("Category")
        .select("id")
        .in("slug", expandedCategories);
      
      if (catData && catData.length > 0) {
        const catIds = Array.from(new Set(catData.map(c => c.id)));
        query = query.in('categoryId', catIds);
      } else {
        // If no categories match the slugs, return empty results
        return NextResponse.json({ success: true, games: [] });
      }
    }

    // Map sort parameter to column name
    const sortColumn = sort === 'play_count' ? 'playCount' : 
                       sort === 'quality_score' ? 'qualityScore' : 
                       sort === 'newest' ? 'created_at' :
                       'trendScore';

    query = query.order(sortColumn, { ascending: false })
                 .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(
      { success: true, games: data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error("[GAMES API ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
