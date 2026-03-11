import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Seed Settings
    await supabase
      .from("Settings")
      .upsert({
        id: "global",
        siteName: "PlayZ Arcade",
        defaultTheme: "dark",
      }, { onConflict: 'id' });

    // Seed Default Categories
    const categories = [
      { name: "Action", slug: "action-games" },
      { name: "Puzzle", slug: "puzzle-games" },
      { name: "Racing", slug: "racing-games" },
      { name: "Multiplayer", slug: "multiplayer-games" },
    ];

    for (const cat of categories) {
      await supabase
        .from("Category")
        .upsert(cat, { onConflict: 'slug' });
    }

    // Seed Default Sections
    const sections = [
      { name: "Featured Games", slug: "featured", order: 0 },
      { name: "Trending Now", slug: "trending-now", order: 1 },
      { name: "New Releases", slug: "new-releases", order: 2 },
      { name: "Editor's Choice", slug: "editors-choice", order: 3 },
    ];

    for (const section of sections) {
      await supabase
        .from("Section")
        .upsert(section, { onConflict: 'slug' });
    }

    // Seed Games
    const { data: puzzleCat } = await supabase.from("Category").select("*").eq("slug", "puzzle-games").single();
    const { data: actionCat } = await supabase.from("Category").select("*").eq("slug", "action-games").single();

    if (puzzleCat) {
      await supabase
        .from("Game")
        .upsert({
          title: "2048",
          slug: "2048",
          description: "A classic puzzle game where you slide numbered tiles on a grid to combine them and create a tile with the number 2048.",
          categoryId: puzzleCat.id,
          trendScore: 150,
          thumbnail: "https://picsum.photos/seed/2048/800/600",
          iframeUrl: "https://gamepix.com/play/2048",
          isPublished: true,
          isFeatured: true,
        }, { onConflict: 'slug' });
    }

    if (actionCat) {
      await supabase
        .from("Game")
        .upsert({
          title: "Slope",
          slug: "slope",
          description: "Experience the most addictive browser game of the year. Navigate the neon slopes and beat the high score.",
          categoryId: actionCat.id,
          trendScore: 500,
          playCount: 12500,
          thumbnail: "https://picsum.photos/seed/slope/800/600",
          iframeUrl: "https://gamepix.com/play/slope",
          isPublished: true,
          isFeatured: true,
          controls: {
            "left/right": "Move",
            "space": "Pause"
          },
          faq: [
            { "q": "How do I play Slope?", "a": "Use the arrow keys or A/D to steer your ball down the slope." },
            { "q": "Is Slope free?", "a": "Yes, Slope is completely free to play on PlayZ Arcade." }
          ]
        }, { onConflict: 'slug' });

      await supabase
        .from("Game")
        .upsert({
          title: "Tunnel Rush",
          slug: "tunnel-rush",
          description: "Fast-paced 3D runner game. Dodge obstacles in a neon tunnel.",
          categoryId: actionCat.id,
          trendScore: 300,
          playCount: 8500,
          thumbnail: "https://picsum.photos/seed/tunnel/800/600",
          iframeUrl: "https://gamepix.com/play/tunnel-rush",
          isPublished: true,
          isFeatured: false,
        }, { onConflict: 'slug' });
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: any) {
    console.error("[SEED ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
