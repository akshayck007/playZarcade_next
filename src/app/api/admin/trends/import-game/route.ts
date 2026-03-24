import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { trendId } = await req.json();

    if (!trendId) {
      return NextResponse.json({ success: false, error: "Missing trendId" }, { status: 400 });
    }

    // 1. Get Trend Data
    const { data: trend, error: trendError } = await supabase
      .from("TrendingKeyword")
      .select("*")
      .eq("id", trendId)
      .single();

    if (trendError || !trend) {
      return NextResponse.json({ success: false, error: "Trend not found" }, { status: 404 });
    }

    // 2. Check if game already exists by slug
    const slug = trend.shadowSlug || trend.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const { data: existingGame } = await supabase
      .from("Game")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingGame) {
      return NextResponse.json({ success: false, error: "Game with this slug already exists" }, { status: 409 });
    }

    // 3. Create Game Record
    const gameId = uuidv4();
    const hasIframe = !!trend.shadowIframeUrl;
    
    const { data: newGame, error: gameError } = await supabase
      .from("Game")
      .insert({
        id: gameId,
        title: trend.shadowTitle || trend.keyword,
        slug: slug,
        description: trend.shadowSeoDescription || `Play ${trend.keyword} online for free.`,
        contentBody: trend.shadowContent || "",
        thumbnail: trend.shadowThumbnailUrl || "",
        thumbnailUrl: trend.shadowThumbnailUrl || "",
        iframeUrl: trend.shadowIframeUrl || "",
        trendScore: trend.unifiedScore || 0,
        isPublished: hasIframe, // Only publish if playable
        isFeatured: hasIframe && (trend.unifiedScore || 0) > 100, // Only feature if playable and high score
        qualityScore: hasIframe ? 80 : 40
      })
      .select()
      .single();

    if (gameError) throw gameError;

    // 4. Update Trend Status
    await supabase
      .from("TrendingKeyword")
      .update({ status: "imported" })
      .eq("id", trendId);

    return NextResponse.json({ 
      success: true, 
      message: "Game imported successfully!",
      game: newGame
    });

  } catch (error: any) {
    console.error("[IMPORT GAME ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
