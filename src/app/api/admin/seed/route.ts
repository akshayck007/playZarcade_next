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
    const defaultSections = [
      { name: "Featured", slug: "featured", order: 0 },
      { name: "New Releases", slug: "new-releases", order: 1 },
      { name: "Editor's Choice", slug: "editors-choice", order: 2 },
      { name: "Continue Playing", slug: "continue-playing", order: 3 },
    ];

    console.log('[SEED] Starting authoritative section reset...');

    // 1. Get all current sections
    const { data: currentSections } = await supabase.from("Section").select("*");
    
    if (currentSections) {
      const defaultSlugs = defaultSections.map(s => s.slug);
      
      // 2. Delete sections that are NOT in our default list OR are redundant
      const redundantSlugs = ['top-games', 'trending-now', 'trending'];
      const toDelete = currentSections
        .filter(s => !defaultSlugs.includes(s.slug) || redundantSlugs.includes(s.slug))
        .map(s => s.id);

      if (toDelete.length > 0) {
        console.log(`[SEED] Deleting ${toDelete.length} non-default/redundant sections...`);
        // We delete SectionItems first to avoid FK issues if CASCADE isn't set
        await supabase.from("SectionItem").delete().in("sectionId", toDelete);
        await supabase.from("Section").delete().in("id", toDelete);
      }
    }

    // 3. Upsert the 4 default sections to ensure they exist with correct names and orders
    for (const def of defaultSections) {
      console.log(`[SEED] Upserting section: ${def.slug}`);
      const { error } = await supabase
        .from("Section")
        .upsert(def, { onConflict: 'slug' });
      
      if (error) {
        console.error(`[SEED] Error upserting ${def.slug}:`, error);
      }
    }

    // 4. Final verification and order normalization
    const { data: finalSections } = await supabase
      .from("Section")
      .select("*")
      .order("order", { ascending: true });
    
    if (finalSections) {
      for (let i = 0; i < finalSections.length; i++) {
        await supabase
          .from("Section")
          .update({ order: i })
          .eq("id", finalSections[i].id);
      }
    }

    console.log('[SEED] Section reset complete.');

    // Seed Games
    const { data: puzzleCat } = await supabase.from("Category").select("*").eq("slug", "puzzle-games").single();
    const { data: actionCat } = await supabase.from("Category").select("*").eq("slug", "action-games").single();

    if (puzzleCat) {
      await supabase
        .from("Game")
        .upsert({
          id: crypto.randomUUID(),
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
