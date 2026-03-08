import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const { trendId } = await request.json();

    const { data: trend } = await supabase
      .from("TrendingKeyword")
      .select("*")
      .eq("id", trendId)
      .single();

    if (!trend) {
      return NextResponse.json({ success: false, error: "Trend not found" }, { status: 404 });
    }

    let { data: settings } = await supabase
      .from("Settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (!settings) {
      const { data: newSettings } = await supabase
        .from("Settings")
        .insert({ id: "global" })
        .select()
        .single();
      settings = newSettings;
    }

    // 1. Try to find a matching game
    // Priority 1: Exact Title Match
    let { data: matchingGame } = await supabase
      .from("Game")
      .select("*")
      .ilike("title", trend.keyword)
      .limit(1)
      .single();

    // Priority 2: Partial Title Match (Contains)
    if (!matchingGame) {
      const { data } = await supabase
        .from("Game")
        .select("*")
        .ilike("title", `%${trend.keyword}%`)
        .limit(1)
        .single();
      matchingGame = data;
    }

    // Priority 3: Word-based match
    if (!matchingGame) {
      const words = trend.keyword.split(' ').filter((w: string) => w.length > 3);
      if (words.length > 0) {
        const { data } = await supabase
          .from("Game")
          .select("*")
          .or(words.map((word: string) => `title.ilike.%${word}%`).join(','))
          .limit(1)
          .single();
        matchingGame = data;
      }
    }

    // 2. If no match found, handle Shadow Page creation
    if (!matchingGame) {
      if (!settings?.autoCreateShadowGames) {
        return NextResponse.json({ 
          success: false, 
          error: `No relevant game found for "${trend.keyword}". Auto-Shadow is disabled.` 
        }, { status: 400 });
      }

      // Use Gemini to generate game data for the shadow page
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate game metadata for a browser game called "${trend.keyword}". 
        The keyword might include modifiers like "unblocked" or "online". 
        Focus on the core game title.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              faq: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    q: { type: Type.STRING },
                    a: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const gameData = JSON.parse(response.text || "{}");
      
      // Create the Shadow Game
      const slug = trend.keyword.toLowerCase().replace(/\s+/g, '-');
      const { data: newGame } = await supabase
        .from("Game")
        .insert({
          title: gameData.title || trend.keyword,
          slug: slug,
          description: gameData.description || `Play ${trend.keyword} online for free.`,
          thumbnail: `https://picsum.photos/seed/${slug}/800/600`,
          faq: gameData.faq || [],
          isPublished: true,
          iframeUrl: null, // This makes it a shadow page
        })
        .select()
        .single();
      matchingGame = newGame;
    }

    if (!matchingGame) throw new Error("Failed to create or find matching game");

    // 3. Generate the SEO slug
    const seoSlug = `play-${trend.keyword.toLowerCase().replace(/\s+/g, '-')}`;

    // 4. Create the SeoPage
    await supabase
      .from("SeoPage")
      .upsert({
        slug: seoSlug,
        gameId: matchingGame.id,
        modifier: trend.keyword.includes('unblocked') ? 'unblocked' : 'online',
        customTitle: `Play ${trend.keyword} Online - PlayZ Arcade`,
        customDescription: `Experience ${trend.keyword} on PlayZ Arcade. The best place for free browser games. No downloads required.`
      }, { onConflict: 'slug' });

    // 5. Update the trend status
    await supabase
      .from("TrendingKeyword")
      .update({ status: "content_ready" })
      .eq("id", trendId);

    return NextResponse.json({ 
      success: true, 
      message: matchingGame.iframeUrl ? "SEO Page generated successfully" : "Shadow Game and SEO Page created successfully",
      slug: seoSlug,
      gameTitle: matchingGame.title,
      isShadow: !matchingGame.iframeUrl
    });

  } catch (error: any) {
    console.error("[GENERATE SEO ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
