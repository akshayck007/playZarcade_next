import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MODIFIERS = ["unblocked", "online", "fullscreen", "mobile", "pc"];

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();
    
    const { data: game } = await supabase
      .from("Game")
      .select("*")
      .eq("id", gameId)
      .single();

    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    let count = 0;
    for (const modifier of MODIFIERS) {
      const seoSlug = `play-${game.slug}-${modifier}`;
      
      const { data: existing } = await supabase
        .from("SeoPage")
        .select("*")
        .eq("slug", seoSlug)
        .single();

      if (!existing) {
        await supabase
          .from("SeoPage")
          .insert({
            gameId: game.id,
            slug: seoSlug,
            modifier: modifier,
          });
        count++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${count} SEO pages for ${game.title}` 
    });
  } catch (error: any) {
    console.error("[SEO GEN ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
